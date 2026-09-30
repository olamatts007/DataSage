import React, { useEffect, useMemo, useState } from 'react'
import { useStore, useEngine, useEntitlements } from '../state/store'
import { Invoice, InvoiceItem, VatTreatment } from '../lib/types'
import { invoiceTotals, nextInvoiceNumber, invoiceLedgerEntries, invoiceWhatsAppLink } from '../lib/invoice'
import { naira, fmtDate, uid } from '../lib/format'
import { PageHead, Notice, EmptyState, Icon, Stat } from '../components/ui'
import { UpgradeModal } from '../components/paywall'

const blankItem = (): InvoiceItem => ({ id: uid(), description: '', qty: 1, unitPrice: 0, vat: 'standard' })

export default function Invoices() {
  const { state, dispatch } = useStore()
  const { classification: cls } = useEngine()
  const ent = useEntitlements()
  const [selId, setSelId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [printing, setPrinting] = useState<Invoice | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [draft, setDraft] = useState<Invoice | null>(null)

  const invoices = state.invoices
  const sel = invoices.find((i) => i.id === selId) ?? null

  const totalsAll = useMemo(() => {
    let invoiced = 0, paid = 0
    for (const i of invoices) {
      if (i.status === 'draft') continue
      const t = invoiceTotals(i)
      invoiced += t.total
      if (i.status === 'paid') paid += t.total
    }
    return { invoiced, paid, outstanding: invoiced - paid }
  }, [invoices])

  // print mode: render only the sheet while the browser prints
  useEffect(() => {
    if (!printing) return
    const after = () => setPrinting(null)
    window.addEventListener('afterprint', after)
    const t = setTimeout(() => window.print(), 80)
    return () => { clearTimeout(t); window.removeEventListener('afterprint', after) }
  }, [printing])

  const startNew = () => {
    setDraft({
      id: uid(),
      number: nextInvoiceNumber(invoices, state.year),
      issuedAt: new Date().toISOString().slice(0, 10),
      dueAt: '',
      customerName: '',
      customerTin: '',
      customerAddress: '',
      items: [blankItem()],
      vatApplied: cls.vatRequired,
      notes: '',
      status: 'draft',
      postedToLedger: false,
      paidAt: '',
    })
    setSelId(null)
    setEditing(true)
  }

  const editDraft = (inv: Invoice) => { setDraft({ ...inv, items: inv.items.map((i) => ({ ...i })) }); setEditing(true) }

  const saveDraft = (issue: boolean) => {
    if (!draft || !draft.customerName.trim() || draft.items.every((i) => !i.description.trim())) return
    const clean = {
      ...draft,
      items: draft.items.filter((i) => i.description.trim() && i.qty > 0 && i.unitPrice >= 0),
    }
    const finalized = issue ? { ...clean, status: 'issued' as const } : clean
    if (invoices.some((i) => i.id === finalized.id)) dispatch({ type: 'updateInvoice', inv: finalized })
    else dispatch({ type: 'addInvoice', inv: finalized })
    setEditing(false)
    setDraft(null)
    setSelId(finalized.id)
  }

  const postToLedger = (inv: Invoice) => {
    if (inv.postedToLedger) return
    const entries = invoiceLedgerEntries(inv)
    const remaining = isFinite(ent.limits.records) ? ent.limits.records - state.transactions.length : Infinity
    if (entries.length > remaining) { setUpgradeOpen(true); return }
    dispatch({ type: 'addManyTx', txs: entries })
    dispatch({ type: 'updateInvoice', inv: { ...inv, postedToLedger: true } })
  }

  const markPaid = (inv: Invoice, paid: boolean) => {
    dispatch({
      type: 'updateInvoice',
      inv: { ...inv, status: paid ? 'paid' : 'issued', paidAt: paid ? new Date().toISOString().slice(0, 10) : '' },
    })
  }

  // ── print sheet (whole page swaps to the document) ──
  if (printing) return <InvoiceSheet inv={printing} business={state.profile.name} tin={state.profile.tin} loc={state.profile.state} />

  if (editing && draft) {
    return (
      <InvoiceEditor
        draft={draft}
        setDraft={setDraft}
        onCancel={() => { setEditing(false); setDraft(null) }}
        onSave={(issue) => saveDraft(issue)}
        vatHint={cls.vatRequired ? 'you are VAT-registered/required — 7.5% is added to standard-rated lines' : 'small-business relief: you are not charging VAT (opt in on the invoice if needed)'}
      />
    )
  }

  return (
    <div>
      <PageHead
        title="Invoices — Sell"
        sub={<>Issue VAT-aware invoices your customers can receive on WhatsApp or print. Finalising an invoice <b>posts the sale straight into your ledger</b> — your books write themselves as you sell.</>}
        right={<button className="btn btn-primary" onClick={startNew}><Icon name="plus" size={14} /> New invoice</button>}
      />

      {!profileReady(state.profile.name) && (
        <div className="mb16">
          <Notice tone="amber" title="Name your business first">
            Invoice headers use your business profile. <a href="#/profile"><b>Set business name & TIN →</b></a>
          </Notice>
        </div>
      )}

      <div className="grid g4 mb16">
        <Stat tone="accent" k="Invoiced (issued)" v={naira(totalsAll.invoiced)} s={`${invoices.filter((i) => i.status !== 'draft').length} issued invoice(s)`} />
        <Stat tone="gold" k="Collected" v={naira(totalsAll.paid)} s={`${invoices.filter((i) => i.status === 'paid').length} paid`} />
        <Stat k="Outstanding" v={naira(totalsAll.outstanding)} s="issued, awaiting payment" />
        <Stat k="Drafts" v={String(invoices.filter((i) => i.status === 'draft').length)} s="not yet issued" />
      </div>

      {invoices.length === 0 ? (
        <div className="card">
          <EmptyState icon="receipt" title="No invoices yet"
            action={<button className="btn btn-primary" onClick={startNew}><Icon name="plus" size={14} /> Create your first invoice</button>}>
            Selling is the everyday job; the tax books are the by-product. Issue an invoice and the income lands in the
            ledger automatically — VAT treatment included.
          </EmptyState>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1.35fr', alignItems: 'start' }}>
          {/* invoice list */}
          <div className="card card-pad">
            <h3 className="card-title">All invoices</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {invoices.slice().reverse().map((inv) => {
                const t = invoiceTotals(inv)
                const active = selId === inv.id
                return (
                  <button key={inv.id} className="inv-row" onClick={() => setSelId(inv.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                    padding: '10px 8px', border: 'none', borderBottom: '1px solid var(--line-soft)', cursor: 'pointer',
                    background: active ? 'var(--green-50)' : 'transparent', borderRadius: active ? 10 : 0,
                  }}>
                    <div className="grow">
                      <div className="small" style={{ fontWeight: 700 }}>{inv.number} <span className="dim">· {inv.customerName}</span></div>
                      <div className="hint" style={{ marginTop: 1 }}>{fmtDate(inv.issuedAt)} · {inv.items.length} item(s)</div>
                    </div>
                    <div className="num mono" style={{ fontWeight: 700 }}>{naira(t.total)}</div>
                    <span className={`chip ${inv.status === 'paid' ? 'green' : inv.status === 'issued' ? 'amber' : ''}`}>{inv.status}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* selected invoice */}
          <div>
            {!sel ? (
              <div className="card card-pad center dim small" style={{ padding: 40 }}>Select an invoice to preview, print, share on WhatsApp or post to the ledger.</div>
            ) : (
              <div>
                <div className="row wrap mb8 no-print">
                  <button className="btn btn-ghost btn-sm" onClick={() => setPrinting(sel)}><Icon name="print" size={13} /> Print / PDF</button>
                  <a className="btn btn-ghost btn-sm" href={invoiceWhatsAppLink(sel, state.profile.name)} target="_blank" rel="noreferrer"><Icon name="share" size={13} /> WhatsApp</a>
                  {sel.status === 'draft' && <button className="btn btn-ghost btn-sm" onClick={() => editDraft(sel)}><Icon name="gear" size={13} /> Edit draft</button>}
                  {sel.status !== 'draft' && !sel.postedToLedger && (
                    <button className="btn btn-primary btn-sm" onClick={() => postToLedger(sel)}><Icon name="records" size={13} /> Post to ledger</button>
                  )}
                  {sel.postedToLedger && <span className="chip green"><Icon name="check" size={11} /> in ledger</span>}
                  {sel.status === 'issued' && <button className="btn btn-gold btn-sm" onClick={() => markPaid(sel, true)}>Mark paid</button>}
                  {sel.status === 'paid' && <button className="btn btn-ghost btn-sm" onClick={() => markPaid(sel, false)}>Revert to issued</button>}
                  <span className="grow" />
                  <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm(`Delete ${sel.number}? Ledger entries already posted stay in the ledger.`)) { dispatch({ type: 'deleteInvoice', id: sel.id }); setSelId(null) } }}>
                    <Icon name="trash" size={12} />
                  </button>
                </div>
                <InvoiceSheet inv={sel} business={state.profile.name} tin={state.profile.tin} loc={state.profile.state} />
              </div>
            )}
          </div>
        </div>
      )}

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </div>
  )
}

function profileReady(name: string) { return name.trim().length > 0 }

// ── invoice document ─────────────────────────────────────────────────────────

export function InvoiceSheet({ inv, business, tin, loc }: { inv: Invoice; business: string; tin: string; loc: string }) {
  const t = invoiceTotals(inv)
  return (
    <div className="card invoice-sheet">
      <div className="inv-head">
        <div className="inv-logo">₦</div>
        <div>
          <div className="inv-biz">{business || 'Your business name'}</div>
          <div className="inv-meta">{[tin ? `TIN: ${tin}` : '', loc].filter(Boolean).join(' · ')}</div>
        </div>
        <div className="right">
          <div className="inv-title">INVOICE</div>
          <div className="inv-meta">{inv.number}</div>
          {inv.status === 'paid' && <span className="chip green" style={{ marginTop: 4 }}>PAID {inv.paidAt && fmtDate(inv.paidAt)}</span>}
        </div>
      </div>

      <div className="inv-cols">
        <div>
          <div className="inv-lab">Billed to</div>
          <div className="small" style={{ fontWeight: 700 }}>{inv.customerName}</div>
          {inv.customerTin && <div className="hint">TIN: {inv.customerTin}</div>}
          {inv.customerAddress && <div className="hint">{inv.customerAddress}</div>}
        </div>
        <div className="right">
          <div className="inv-lab">Issued</div>
          <div className="small" style={{ fontWeight: 650 }}>{fmtDate(inv.issuedAt)}</div>
          <div className="inv-lab mt8">Due</div>
          <div className="small" style={{ fontWeight: 650 }}>{inv.dueAt ? fmtDate(inv.dueAt) : 'On receipt'}</div>
        </div>
      </div>

      <table className="tbl inv-tbl">
        <thead>
          <tr><th>Description</th><th className="num">Qty</th><th className="num">Unit price</th><th>VAT line</th><th className="num">Amount</th></tr>
        </thead>
        <tbody>
          {inv.items.map((i) => (
            <tr key={i.id}>
              <td>{i.description}</td>
              <td className="num">{i.qty}</td>
              <td className="num">{naira(i.unitPrice)}</td>
              <td className="small dim">{i.vat === 'standard' ? 'Standard 7.5%' : i.vat === 'zero_rated' ? 'Zero-rated 0%' : i.vat === 'exempt' ? 'Exempt' : 'Outside scope'}</td>
              <td className="num" style={{ fontWeight: 650 }}>{naira(i.qty * i.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="inv-total">
        <div className="inv-tr"><span>Subtotal (VAT-exclusive)</span><span className="num mono">{naira(t.subtotal)}</span></div>
        {inv.vatApplied && <div className="inv-tr"><span>VAT @ 7.5% (standard-rated lines)</span><span className="num mono">{naira(t.vat)}</span></div>}
        <div className="inv-tr strong"><span>Total due</span><span className="num mono">{naira(t.total)}</span></div>
      </div>

      {inv.notes.trim() && <div className="inv-notes"><span className="inv-lab">Notes</span><div className="small">{inv.notes}</div></div>}

      <div className="inv-foot">
        Generated with TaxSage · VAT and treatment per Nigeria Tax Act 2025 · keep this invoice for your books (6-year retention, NTAA 2025)
      </div>
    </div>
  )
}

// ── invoice editor ───────────────────────────────────────────────────────────

function InvoiceEditor({ draft, setDraft, onCancel, onSave, vatHint }: {
  draft: Invoice
  setDraft: (i: Invoice) => void
  onCancel: () => void
  onSave: (issue: boolean) => void
  vatHint: string
}) {
  const setItem = (id: string, patch: Partial<InvoiceItem>) =>
    setDraft({ ...draft, items: draft.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })
  const t = invoiceTotals(draft)
  const canSave = draft.customerName.trim() && draft.items.some((i) => i.description.trim())

  return (
    <div>
      <PageHead title={draft.number} sub="Draft invoice — save for later or issue it straight to your customer." />
      <div className="card card-pad mb16">
        <div className="frow g2 mb16">
          <div>
            <label className="lab">Customer name *</label>
            <input className="inp" value={draft.customerName} onChange={(e) => setDraft({ ...draft, customerName: e.target.value })} placeholder="e.g. ShopCity Ltd" />
          </div>
          <div>
            <label className="lab">Customer TIN (optional)</label>
            <input className="inp mono" value={draft.customerTin} onChange={(e) => setDraft({ ...draft, customerTin: e.target.value })} placeholder="helps their WHT duties too" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="lab">Customer address (optional)</label>
            <input className="inp" value={draft.customerAddress} onChange={(e) => setDraft({ ...draft, customerAddress: e.target.value })} placeholder="street, city, state" />
          </div>
          <div>
            <label className="lab">Issue date</label>
            <input className="inp" type="date" value={draft.issuedAt} onChange={(e) => setDraft({ ...draft, issuedAt: e.target.value })} />
          </div>
          <div>
            <label className="lab">Due date (optional)</label>
            <input className="inp" type="date" value={draft.dueAt} onChange={(e) => setDraft({ ...draft, dueAt: e.target.value })} />
          </div>
        </div>

        <label className="lab">Line items</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {draft.items.map((i) => (
            <div key={i.id} className="inv-item-row">
              <input className="inp" style={{ flex: 2.4 }} placeholder="what are you selling? (e.g. 50kg fortified garri)" value={i.description} onChange={(e) => setItem(i.id, { description: e.target.value })} />
              <input className="inp mono" style={{ flex: 0.55 }} inputMode="decimal" placeholder="Qty" value={i.qty || ''} onChange={(e) => setItem(i.id, { qty: Number(e.target.value) || 0 })} />
              <input className="inp mono" style={{ flex: 0.9 }} inputMode="numeric" placeholder="Unit price ₦" value={i.unitPrice || ''} onChange={(e) => setItem(i.id, { unitPrice: Number(e.target.value.replace(/,/g, '')) || 0 })} />
              <select className="inp" style={{ flex: 1.05 }} value={i.vat} onChange={(e) => setItem(i.id, { vat: e.target.value as VatTreatment })}>
                <option value="standard">Standard 7.5%</option>
                <option value="zero_rated">Zero-rated 0%</option>
                <option value="exempt">Exempt</option>
                <option value="non_vatable">Outside scope</option>
              </select>
              <button className="btn btn-danger btn-sm" onClick={() => draft.items.length > 1 && setDraft({ ...draft, items: draft.items.filter((x) => x.id !== i.id) })}><Icon name="trash" size={12} /></button>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm mt8" onClick={() => setDraft({ ...draft, items: [...draft.items, blankItem()] })}><Icon name="plus" size={12} /> Add line</button>

        <div className="check-row mt16" onClick={() => setDraft({ ...draft, vatApplied: !draft.vatApplied })}>
          <input type="checkbox" checked={draft.vatApplied} readOnly />
          <div>
            <div className="t">Charge 7.5% VAT on standard-rated lines</div>
            <div className="d">{vatHint}</div>
          </div>
        </div>

        <div className="mt16">
          <label className="lab">Notes / payment instructions (optional)</label>
          <textarea className="inp" rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="e.g. Pay to Moniepoint 0123… within 14 days" />
        </div>

        <div className="inv-total" style={{ maxWidth: 360, marginLeft: 'auto' }}>
          <div className="inv-tr"><span>Subtotal</span><span className="num mono">{naira(t.subtotal)}</span></div>
          {draft.vatApplied && <div className="inv-tr"><span>VAT @ 7.5%</span><span className="num mono">{naira(t.vat)}</span></div>}
          <div className="inv-tr strong"><span>Total due</span><span className="num mono">{naira(t.total)}</span></div>
        </div>
      </div>

      <div className="row wrap">
        <button className="btn btn-primary" disabled={!canSave} onClick={() => onSave(true)}><Icon name="check" size={14} /> Issue invoice</button>
        <button className="btn btn-ghost" disabled={!canSave} onClick={() => onSave(false)}>Save as draft</button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
