import React, { useMemo, useState } from 'react'
import { useStore } from '../state/store'
import {
  GRANT_LABELS, GrantKind, generateCode, setAdminAuthed,
  AccessCode, GateMode,
} from '../lib/access'
import { fmtDate, uid } from '../lib/format'
import { download } from '../lib/csv'
import { PageHead, Notice, Icon, Stat } from '../components/ui'

export default function Admin() {
  const { state, dispatch } = useStore()
  const [copied, setCopied] = useState('')
  const [form, setForm] = useState({
    grant: 'trial' as GrantKind,
    note: '',
    expiresInDays: 30 as number | 0, // 0 = never
    maxActivations: 1,
  })
  const [newCode, setNewCode] = useState<AccessCode | null>(null)

  // Visiting this console counts as admin presence for the session — no login required.
  React.useEffect(() => setAdminAuthed(true), [])

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

  /** Provisioning bundle — ship as public/access-codes.json so hosted test URLs carry the
      registry AND the chosen gate mode (customers' browser ≠ your localStorage). */
  const exportProvisionFile = () =>
    download(
      'access-codes.json',
      JSON.stringify(
        {
          note: 'TaxSage provisioning bundle. Place at public/access-codes.json, rebuild (npm run build) and redeploy. "gate" controls whether visitors see the access gate.',
          gate: state.gateMode,
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

  const setGate = (mode: GateMode) => {
    dispatch({ type: 'setGateMode', mode })
    if (mode === 'open') setCopied('')
  }

  return (
    <div>
      <PageHead
        title="Access Control"
        sub="No sign-in needed — this console is open on your device. Generate codes for customers, flip the gate on/off, and ship everything with hosted builds."
        right={
          <button className="btn btn-primary" onClick={() => { window.location.hash = '#/overview' }}>
            <Icon name="arrow" size={14} /> Open app
          </button>
        }
      />

      {/* gate mode */}
      <div className="card card-pad mb16">
        <div className="flex-between">
          <div>
            <h3 className="card-title">App access mode</h3>
            <p className="card-sub" style={{ marginBottom: 0 }}>
              <b>Gate on</b> — visitors must enter a code to use the app. <b>Open</b> — everyone gets straight in (no wall at all).
              Hosted URLs inherit the mode from your provisioning bundle.
            </p>
          </div>
          <div className="period-toggle" style={{ minWidth: 210, margin: 0 }}>
            <button className={state.gateMode === 'open' ? 'on' : ''} onClick={() => setGate('open')}>
              🔓 Open access
            </button>
            <button className={state.gateMode === 'code' ? 'on' : ''} onClick={() => setGate('code')}>
              🔒 Gate with codes
            </button>
          </div>
        </div>
        {state.gateMode === 'open' && (
          <div className="mt8"><Notice tone="blue">Open access is active on this device — the app loads directly with no code. Hosted copies keep their own setting until you ship a new provisioning bundle.</Notice></div>
        )}
      </div>

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
              <li>Run <span className="mono">npm run build</span> → share <b>taxsage-prototype.zip</b> (or host <span className="mono">dist/</span> / enable GitHub Pages on <span className="mono">docs/</span>).</li>
              <li>With the gate <b>on</b>, customers see the access gate first. With the gate <b>off</b> they get straight in.</li>
              <li>Send each customer a code from this console (copy the share message — WhatsApp-ready).</li>
              <li>Watch activations; revoke instantly.</li>
            </ol>
            <button className="btn btn-ghost btn-sm mt8" onClick={exportCodes} disabled={!state.accessCodes.length}>
              <Icon name="download" size={13} /> Export codes (.json)
            </button>
          </div>

          <div className="card card-pad" style={{ borderColor: '#ecd996', background: '#fffdf4' }}>
            <h3 className="card-title">⚠ Hosted URL? Ship the settings too</h3>
            <p className="small" style={{ margin: '4px 0 8px' }}>
              Each browser keeps its own registry & gate mode. Customers opening your <b>hosted test URL</b> start
              fresh — bundle your settings into the deployment:
            </p>
            <ol className="small" style={{ margin: 0, paddingLeft: 17, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <li>Generate codes & set the gate mode above.</li>
              <li><b>Download the provisioning bundle</b> below.</li>
              <li>Save it as <span className="mono">public/access-codes.json</span> in the repo.</li>
              <li>Rebuild & redeploy (<span className="mono">npm run deploy:test</span>).</li>
            </ol>
            <button className="btn btn-gold btn-sm mt8" onClick={exportProvisionFile} disabled={!state.accessCodes.length && state.gateMode === 'code'}>
              <Icon name="download" size={13} /> Download provisioning bundle (access-codes.json)
            </button>
            <div className="hint mt8">The bundle carries your gate mode too — <b>{state.gateMode === 'open' ? 'open access' : 'code gate'}</b> will ship.</div>
          </div>
        </div>

        <div className="card card-pad" style={{ alignSelf: 'start' }}>
          <h3 className="card-title">Access code registry</h3>
          <p className="card-sub">Status, usage and controls for every issued code.</p>
          {state.accessCodes.length === 0 ? (
            <Notice tone="blue">No codes yet — generate your first one on the left, or switch to Open access above if you don't need codes at all.</Notice>
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
                          <button className="btn btn-ghost btn-sm" onClick={() => copy(shareText(c), c.id)}>{copied === c.id ? '✓' : 'Share'}</button>
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
            Prototype-grade control: validation happens client-side on the customer's device copy of the registry —
            for production, pair this with a server-side code store (see docs/DESIGN.md §6b).
          </div>
        </div>
      </div>
    </div>
  )
}
