import React, { useMemo, useState } from 'react'
import { useStore } from '../state/store'
import {
  GRANT_LABELS, GrantKind, generateCode, getAdminPassHash, setAdminPassHash,
  sha256, isAdminAuthed, setAdminAuthed, writeAccessSession, AccessCode,
} from '../lib/access'
import { fmtDate } from '../lib/format'
import { download } from '../lib/csv'
import { PageHead, Notice, Icon, Stat } from '../components/ui'
import { uid } from '../lib/format'

type Stage = 'setup' | 'login' | 'in'

export default function Admin() {
  const { state, dispatch } = useStore()
  const [stage, setStage] = useState<Stage>(() => (isAdminAuthed() ? 'in' : getAdminPassHash() ? 'login' : 'setup'))
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState('')
  const [form, setForm] = useState({
    grant: 'trial' as GrantKind,
    note: '',
    expiresInDays: 30 as number | 0, // 0 = never
    maxActivations: 1,
  })
  const [newCode, setNewCode] = useState<AccessCode | null>(null)

  const setup = async () => {
    if (p1.length < 8) return setErr('Use at least 8 characters.')
    if (p1 !== p2) return setErr('Passcodes do not match.')
    setAdminPassHash(await sha256(p1))
    setAdminAuthed(true)
    setStage('in')
  }

  const login = async () => {
    if ((await sha256(pw)) === getAdminPassHash()) {
      setAdminAuthed(true)
      setPw('')
      setStage('in')
    } else setErr('Incorrect admin passcode.')
  }

  const logout = () => {
    setAdminAuthed(false)
    setStage('login')
  }

  const makeCode = () => {
    const code: AccessCode = {
      id: uid(),
      code: generateCode(),
      note: form.note.trim(),
      createdAt: new Date().toISOString(),
      expiresAt: form.expiresInDays ? new Date(Date.now() + form.expiresInDays * 86_400_000).toISOString() : '',
      maxActivations: form.maxActivations,
      grant: form.grant,
      revoked: false,
      activations: [],
    }
    dispatch({ type: 'addAccessCode', code: code })
    setNewCode(code)
    setForm((f) => ({ ...f, note: '' }))
  }

  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 1500) } catch { /* clipboard blocked */ }
  }

  const shareText = (c: AccessCode) =>
    `TaxSage prototype access — open the app, enter code ${c.code}. Grant: ${GRANT_LABELS[c.grant]}${c.expiresAt ? ` · valid until ${fmtDate(c.expiresAt.slice(0, 10))}` : ''}${c.maxActivations ? ` · ${c.maxActivations} activation(s) max` : ''}.`

  const exportCodes = () =>
    download(
      `taxsage-access-codes-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ exportedAt: new Date().toISOString(), codes: state.accessCodes }, null, 2),
      'application/json'
    )

  /** Provisioning bundle — the exact file to ship as public/access-codes.json in the build,
      so customers opening a HOSTED URL get the registry (their browser ≠ your localStorage). */
  const exportProvisionFile = () =>
    download(
      'access-codes.json',
      JSON.stringify(
        {
          note: 'TaxSage provisioning bundle. Place this file at public/access-codes.json, rebuild (npm run build) and redeploy. Local device state still overrides for revocations made after shipping.',
          generatedAt: new Date().toISOString(),
          codes: state.accessCodes,
        },
        null,
        2
      ),
      'application/json'
    )

  const stats = useMemo(() => {
    const now = Date.now()
    const live = state.accessCodes.filter(
      (c) => !c.revoked && (!c.expiresAt || new Date(c.expiresAt).getTime() > now) && (c.maxActivations === 0 || c.activations.length < c.maxActivations)
    )
    return {
      total: state.accessCodes.length,
      live: live.length,
      activations: state.accessCodes.reduce((s, c) => s + c.activations.length, 0),
    }
  }, [state.accessCodes])

  const codeStatus = (c: AccessCode) => {
    if (c.revoked) return <span className="chip red">revoked</span>
    if (c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()) return <span className="chip red">expired</span>
    if (c.maxActivations > 0 && c.activations.length >= c.maxActivations) return <span className="chip amber">exhausted</span>
    return <span className="chip green">live</span>
  }

  // ── auth screens ──────────────────────────────────────────────────────────
  if (stage !== 'in') {
    return (
      <div className="gate-screen">
        <div className="gate-card card">
          <div className="brand-mark" style={{ justifyContent: 'center', fontSize: 22 }}>
            <span className="logo">₦</span> <span style={{ color: 'var(--green-950)' }}>Admin</span>
          </div>
          <p className="small dim center mt8" style={{ maxWidth: 380, margin: '8px auto 0' }}>
            {stage === 'setup'
              ? 'Create the administrator passcode for this device. It controls access-code generation — keep it private.'
              : 'Enter the administrator passcode to manage customer test-run access codes.'}
          </p>
          {stage === 'setup' ? (
            <div className="mt16">
              <label className="lab">New admin passcode</label>
              <input className="inp" type="password" value={p1} onChange={(e) => { setP1(e.target.value); setErr('') }} placeholder="min. 8 characters" />
              <label className="lab mt8">Repeat passcode</label>
              <input className="inp" type="password" value={p2} onChange={(e) => { setP2(e.target.value); setErr('') }} />
            </div>
          ) : (
            <div className="mt16">
              <label className="lab">Admin passcode</label>
              <input className="inp" type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr('') }} onKeyDown={(e) => e.key === 'Enter' && login()} autoFocus />
            </div>
          )}
          {err && <div className="notice red mt8"><Icon name="alert" size={15} /><div>{err}</div></div>}
          <button className="btn btn-primary mt16" style={{ width: '100%' }} onClick={stage === 'setup' ? setup : login}>
            {stage === 'setup' ? 'Create passcode & enter' : 'Sign in'}
          </button>
          <div className="center mt16"><a href="#/" className="small dim" style={{ textDecoration: 'underline' }}>← Back to access gate</a></div>
          <div className="hint center mt8">Forgot the passcode? Clear this site's storage (dev tools → Application → Local Storage) to reset.</div>
        </div>
      </div>
    )
  }

  // ── admin console ─────────────────────────────────────────────────────────
  return (
    <div>
      <PageHead
        title="Admin — Test-Run Access Control"
        sub="Generate, share and revoke access codes. Every code carries a plan grant (trial or Premium period), an expiry and an activation cap. Customers unlock the prototype at the access gate."
        right={
          <>
            <button className="btn btn-ghost" onClick={() => { writeAccessSession(null); window.location.hash = '#/overview' }}>
              <Icon name="arrow" size={14} /> Open app as admin
            </button>
            <button className="btn btn-danger" onClick={logout}>Sign out</button>
          </>
        }
      />

      <div className="grid g3 mb16">
        <Stat tone="accent" k="Codes issued" v={stats.total} s="all time, this device" />
        <Stat tone="gold" k="Live codes" v={stats.live} s="usable right now" />
        <Stat k="Activations recorded" v={stats.activations} s="customer unlocks via the gate" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '340px 1fr' }}>
        <div className="grid" style={{ alignContent: 'start' }}>
          <div className="card card-pad">
            <h3 className="card-title">Generate access code</h3>
            <p className="card-sub">One customer — or one cohort — per code.</p>
            <label className="lab">Customer / cohort label</label>
            <input className="inp" placeholder="e.g. 'Mrs. Bello — Bello Foods'" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            <label className="lab mt8">Plan granted on activation</label>
            <select className="inp" value={form.grant} onChange={(e) => setForm({ ...form, grant: e.target.value as GrantKind })}>
              {(Object.keys(GRANT_LABELS) as GrantKind[]).map((g) => <option key={g} value={g}>{GRANT_LABELS[g]}</option>)}
            </select>
            <div className="frow g2 mt8">
              <div>
                <label className="lab">Expires</label>
                <select className="inp" value={form.expiresInDays} onChange={(e) => setForm({ ...form, expiresInDays: Number(e.target.value) as typeof form.expiresInDays })}>
                  <option value={7}>in 7 days</option>
                  <option value={30}>in 30 days</option>
                  <option value={90}>in 90 days</option>
                  <option value={0}>never</option>
                </select>
              </div>
              <div>
                <label className="lab">Activations allowed</label>
                <select className="inp" value={form.maxActivations} onChange={(e) => setForm({ ...form, maxActivations: Number(e.target.value) })}>
                  <option value={1}>1 (single use)</option>
                  <option value={3}>3</option>
                  <option value={10}>10</option>
                  <option value={0}>unlimited</option>
                </select>
              </div>
            </div>
            <button className="btn btn-gold mt16" style={{ width: '100%' }} onClick={makeCode}><Icon name="plus" size={14} /> Generate code</button>

            {newCode && (
              <div className="bank-box mt16" style={{ borderColor: 'var(--gold-500)', background: '#fffdf4' }}>
                <div className="small dim">New code generated — share it now (you can re-view it in the list):</div>
                <div className="mono center" style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, margin: '10px 0' }}>{newCode.code}</div>
                <div className="row wrap">
                  <button className="btn btn-ghost btn-sm" onClick={() => copy(newCode.code, 'new')}>{copied === 'new' ? '✓ copied' : 'Copy code'}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => copy(shareText(newCode), 'msg')}>{copied === 'msg' ? '✓ copied' : 'Copy share message'}</button>
                </div>
                <div className="hint mt8">{GRANT_LABELS[newCode.grant]} · {newCode.expiresAt ? `expires ${fmtDate(newCode.expiresAt.slice(0, 10))}` : 'no expiry'} · {newCode.maxActivations || 'unlimited'} use(s)</div>
              </div>
            )}
          </div>

          <div className="card card-pad">
            <h3 className="card-title">Distributing the prototype</h3>
            <ol className="small" style={{ margin: '6px 0 0', paddingLeft: 17, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Run <span className="mono">npm run build</span> → share the <b>taxsage-prototype.zip</b> bundle (or host <span className="mono">dist/</span> on any static host).</li>
              <li>Customers open the app and land on the <b>access gate</b> — nothing else loads.</li>
              <li>Send each customer a code from this console (copy the share message — WhatsApp-ready).</li>
              <li>Watch activations below; revoke instantly to cut access. Revoked codes are blocked at next validation.</li>
            </ol>
            <button className="btn btn-ghost btn-sm mt8" onClick={exportCodes} disabled={!state.accessCodes.length}>
              <Icon name="download" size={13} /> Export codes (.json)
            </button>
          </div>

          <div className="card card-pad" style={{ borderColor: '#ecd996', background: '#fffdf4' }}>
            <h3 className="card-title">⚠ Hosted URL? Ship the codes too</h3>
            <p className="small" style={{ margin: '4px 0 8px' }}>
              Each browser keeps its own registry. Customers opening your <b>hosted test URL</b> start with an
              <b> empty</b> registry — generate codes here, then embed them in the deployment:
            </p>
            <ol className="small" style={{ margin: 0, paddingLeft: 17, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <li>Generate the codes on the left.</li>
              <li><b>Download the provisioning bundle</b> below.</li>
              <li>Save it as <span className="mono">public/access-codes.json</span> in the repo.</li>
              <li>Rebuild & redeploy (<span className="mono">npm run deploy:test</span>).</li>
            </ol>
            <button className="btn btn-gold btn-sm mt8" onClick={exportProvisionFile} disabled={!state.accessCodes.length}>
              <Icon name="download" size={13} /> Download provisioning bundle (access-codes.json)
            </button>
            <div className="hint mt8">Revoking after shipment = revoke here, re-download, redeploy. Local test copies manage themselves.</div>
          </div>
        </div>

        <div className="card card-pad" style={{ alignSelf: 'start' }}>
          <h3 className="card-title">Access code registry</h3>
          <p className="card-sub">Status, usage and controls for every issued code.</p>
          {state.accessCodes.length === 0 ? (
            <Notice tone="blue">No codes yet — generate your first one on the left and share it with a test customer.</Notice>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead><tr><th>Code</th><th>Customer</th><th>Grant</th><th>Expires</th><th className="num">Uses</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {[...state.accessCodes].reverse().map((c) => (
                    <tr key={c.id}>
                      <td className="mono" style={{ fontWeight: 700 }}>{c.code}</td>
                      <td className="small">{c.note || <span className="dim">—</span>}</td>
                      <td className="small">{GRANT_LABELS[c.grant]}</td>
                      <td className="small mono">{c.expiresAt ? fmtDate(c.expiresAt.slice(0, 10)) : 'never'}</td>
                      <td className="num">{c.activations.length}{c.maxActivations ? `/${c.maxActivations}` : ' ∞'}</td>
                      <td>{codeStatus(c)}</td>
                      <td>
                        <div className="row" style={{ gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => copy(c.id === 'x' ? '' : shareText(c), c.id)}>{copied === c.id ? '✓' : 'Share'}</button>
                          {!c.revoked && <button className="btn btn-danger btn-sm" onClick={() => dispatch({ type: 'revokeAccessCode', id: c.id })}>Revoke</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="hint mt8" style={{ fontSize: 11 }}>
            Prototype-grade control: validation happens client-side on the customer's device snapshot of the registry —
            for production, pair this with a server-side code store (see docs/DESIGN.md §Access).
          </div>
        </div>
      </div>
    </div>
  )
}
