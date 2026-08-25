import React, { useState } from 'react'
import { useStore } from '../state/store'
import { checkCode, normalizeCode, REASON_TEXT, writeAccessSession, GRANT_LABELS } from '../lib/access'
import { Icon } from './ui'

/** Full-screen gate shown until the visitor activates a valid access code. */
export default function AccessGate({ onGranted }: { onGranted: () => void }) {
  const { state, dispatch } = useStore()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [granted, setGranted] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const res = checkCode(state.accessCodes, input)
    if (!res.ok) {
      setError(REASON_TEXT[res.reason])
      return
    }
    // record activation + bestow the attached grant (trial or premium period)
    dispatch({ type: 'activateAccessCode', id: res.code.id })
    writeAccessSession({ code: res.code.code, grantedAt: new Date().toISOString(), grant: res.code.grant })
    setError('')
    setGranted(GRANT_LABELS[res.code.grant])
    setTimeout(onGranted, 1200)
  }

  return (
    <div className="gate-screen">
      <div className="gate-card card">
        <div className="brand-mark" style={{ justifyContent: 'center', fontSize: 24 }}>
          <span className="logo">₦</span> <span style={{ color: 'var(--green-950)' }}>TaxSage</span>
        </div>
        <div className="center small dim mt8">Prototype build — customer test run</div>

        <div className="mt24 mb8 center" style={{ fontWeight: 800, fontSize: 17 }}>
          Enter your access code
        </div>
        <p className="small dim center mb16" style={{ maxWidth: 380, margin: '0 auto' }}>
          This app is shared under a controlled test run. The administrator that sent you the
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
              onChange={(e) => { setInput(normalizeCode(e.target.value)); setError('') }}
              autoFocus
              aria-label="Access code"
              autoComplete="off"
              spellCheck={false}
            />
            {error && <div className="notice red mt8"><Icon name="alert" size={15} /><div>{error}</div></div>}
            <button className="btn btn-gold mt16" style={{ width: '100%', fontSize: 14 }} type="submit" disabled={input.length < 14}>
              Unlock prototype <Icon name="arrow" size={15} />
            </button>
          </form>
        )}

        <div className="hint center mt16">
          No code yet? Request one from your TaxSage administrator — each code carries an expiry and
          activation limit, and grants trial or Premium access automatically.
        </div>

        <div className="center mt16">
          <a href="#/admin" className="small dim" style={{ textDecoration: 'underline' }}>Administrator sign-in →</a>
        </div>
      </div>
      <div className="hint center mt16" style={{ maxWidth: 420 }}>
        MSME tax compliance under the gazetted Nigeria Tax Act 2025 · Nigeria Tax Administration Act 2025.
      </div>
    </div>
  )
}
