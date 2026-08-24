import React, { useMemo, useRef, useState } from 'react'
import { useStore, useEngine } from '../state/store'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, WHT_RATES } from '../lib/rules'
import { naira, fmtDate, uid } from '../lib/format'
import { transactionsToCSV, parseTransactionsCSV, download } from '../lib/csv'
import { Transaction } from '../lib/types'
import { PageHead, Notice, EmptyState, Icon } from '../components/ui'

export default function Records() {
  const { state, dispatch } = useStore()
  const { classification: cls, totals, rules } = useEngine()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'income' as 'income' | 'expense',
    category: INCOME_CATEGORIES[0].name,
    description: '',
    amount: '',
    vat: 'standard' as Transaction['vat'],
    whtRate: 0,
    partyName: '',
    partyHasTIN: true,
    nonDeductible: false,
  })
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [importCount, setImportCount] = useState<number | null>(null)

  const cats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const preset = cats.find((c) => c.name === form.category)
  const whtClass = WHT_RATES.find((w) => w.key === preset?.whtKey)

  const applyPreset = (category: string) => {
    const pr = cats.find((c) => c.name === category)
    setForm((f) => ({
      ...f,
      category,
      vat: pr?.vat ?? 'standard',
      whtRate: pr?.whtKey
        ? WHT_RATES.find((w) => w.key === pr.whtKey)!.company * 100 // display %
        : 0,
    }))
  }

  const whtExemptNote = cls.isSmall && form.type === 'income'
    ? 'Small companies: your customers should NOT deduct WHT (NTA 2025 exemption) — record 0% here.'
    : null

  const addTx = () => {
    const amount = Number(form.amount.replace(/,/g, ''))
    if (!amount || amount <= 0) return
    dispatch({
      type: 'addTx',
      tx: {
        id: uid(),
        date: form.date,
        type: form.type,
        category: form.category,
        description: form.description || form.category,
        amount,
        vat: form.vat,
        whtRate: (form.whtRate || 0) / 100,
        partyName: form.partyName,
        partyHasTIN: form.partyHasTIN,
        nonDeductible: form.type === 'expense' ? form.nonDeductible : false,
      },
    })
    setForm((f) => ({ ...f, description: '', amount: '', partyName: '' }))
  }

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then((text) => {
      const { txs, errors } = parseTransactionsCSV(text)
      if (txs.length) dispatch({ type: 'addManyTx', txs })
      setImportErrors(errors)
      setImportCount(txs.length)
    })
    e.target.value = ''
  }

  const rows = useMemo(() => {
    return state.transactions
      .filter((t) => (typeFilter === 'all' ? true : t.type === typeFilter))
      .filter((t) => {
        const q = filter.toLowerCase()
        return !q || [t.category, t.description, t.partyName, t.date].join(' ').toLowerCase().includes(q)
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [state.transactions, filter, typeFilter])

  const vatBadge = (t: Transaction) =>
    t.vat === 'standard' ? <span className="chip blue">7.5%</span>
    : t.vat === 'zero_rated' ? <span className="chip green">0% zero-rated</span>
    : t.vat === 'exempt' ? <span className="chip">exempt</span>
    : <span className="chip">n/a</span>

  return (
    <div>
      <PageHead
        title="Records Ledger — Collate"
        sub={<>Every sale and expense, tagged with VAT treatment and WHT events. This ledger is your <b>legal book of account</b> under the NTAA 2025 — the NRS can request it during a desk review.</>}
        right={
          <>
            <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}><Icon name="upload" size={14} /> Import CSV</button>
            <button className="btn btn-ghost" disabled={!state.transactions.length} onClick={() => download(`taxsage-ledger-${state.year}.csv`, transactionsToCSV(state.transactions))}><Icon name="download" size={14} /> Export CSV</button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={onImport} />
          </>
        }
      />

      {importCount !== null && (
        <div className="mb16">
          <Notice tone={importErrors.length ? 'amber' : 'green'}>
            Imported <b>{importCount}</b> record(s). {importErrors.length > 0 && <>{importErrors.slice(0, 3).map((e) => <div key={e} className="small">⚠ {e}</div>)}</>}
            <div className="hint mt8">CSV columns: date,type,category,description,amount,vat,wht_rate,party_name,party_has_tin,non_deductible</div>
          </Notice>
        </div>
      )}

      {/* entry form */}
      <div className="card card-pad mb16 no-print">
        <h3 className="card-title"><span className="row" style={{ gap: 7 }}><Icon name="plus" size={15} /> Add a transaction</span></h3>
        <p className="card-sub">Enter amounts <b>exclusive of VAT</b> (tax-exclusive basis, as the return requires). Categories auto-suggest VAT treatment and the WHT rate from the 2024 Withholding Regulations.</p>
        <div className="frow" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="lab">Date</label>
            <input className="inp" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="lab">Type</label>
            <select className="inp" value={form.type} onChange={(e) => { const t = e.target.value as 'income' | 'expense'; setForm({ ...form, type: t, category: (t === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0].name }); }}>
              <option value="income">Income (sale)</option>
              <option value="expense">Expense (payment)</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label className="lab">Category {preset?.hint && <span className="dim" style={{ fontWeight: 400 }}>· {preset.hint}</span>}</label>
            <select className="inp" value={form.category} onChange={(e) => applyPreset(e.target.value)}>
              {cats.map((c) => <option key={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label className="lab">Description / reference</label>
            <input className="inp" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="invoice no., narration…" />
          </div>
          <div>
            <label className="lab">Amount (₦)</label>
            <input className="inp mono" inputMode="numeric" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className="lab">VAT treatment</label>
            <select className="inp" value={form.vat} onChange={(e) => setForm({ ...form, vat: e.target.value as any })}>
              <option value="standard">Standard — 7.5%</option>
              <option value="zero_rated">Zero-rated — 0%</option>
              <option value="exempt">Exempt</option>
              <option value="non_vatable">Outside VAT scope</option>
            </select>
          </div>
          <div>
            <label className="lab">WHT rate % {whtClass && <span className="dim" style={{ fontWeight: 400 }}>· {whtClass.label.slice(0, 26)}…</span>}</label>
            <input className="inp mono" inputMode="decimal" value={form.whtRate} onChange={(e) => setForm({ ...form, whtRate: Number(e.target.value) || 0 })} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="lab">Counterparty (customer/vendor)</label>
            <input className="inp" value={form.partyName} onChange={(e) => setForm({ ...form, partyName: e.target.value })} placeholder="name" />
          </div>
          <div>
            <label className="lab">Counterparty has Tax ID?</label>
            <select className="inp" value={form.partyHasTIN ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, partyHasTIN: e.target.value === 'yes' })}>
              <option value="yes">Yes — TIN verified</option>
              <option value="no">No TIN (risk!)</option>
            </select>
          </div>
          {form.type === 'expense' && (
            <div>
              <label className="lab">Capital / non-deductible?</label>
              <select className="inp" value={form.nonDeductible ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, nonDeductible: e.target.value === 'yes' })}>
                <option value="no">No — deductible expense</option>
                <option value="yes">Yes — capital item</option>
              </select>
            </div>
          )}
          <div style={{ alignSelf: 'end' }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={addTx} disabled={!form.amount}><Icon name="plus" size={14} /> Record</button>
          </div>
        </div>
        {whtExemptNote && <div className="mt8"><Notice tone="blue">{whtExemptNote}</Notice></div>}
        {form.type === 'expense' && !form.partyHasTIN && (
          <div className="mt8"><Notice tone="red">Paying vendors without a Tax ID: WHT rate doubles on the transaction, and awarding contracts to unregistered vendors attracts a ₦5,000,000 penalty under NTAA 2025.</Notice></div>
        )}
      </div>

      {/* summary strip */}
      <div className="grid g4 mb16">
        {[
          ['Gross income (FY)', naira(totals.turnover)],
          ['Deductible expenses', naira(totals.deductibleExpenses)],
          ['WHT suffered (credits)', naira(totals.whtSuffered)],
          ['WHT deducted (to remit)', naira(totals.whtDeducted)],
        ].map(([k, v]) => (
          <div key={k} className="card" style={{ padding: '13px 16px' }}>
            <div className="k small dim" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{k}</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 800, marginTop: 3 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* ledger table */}
      <div className="card card-pad">
        <div className="flex-between mb8">
          <h3 className="card-title" style={{ marginBottom: 0 }}>Ledger ({rows.length} entries)</h3>
          <div className="row no-print">
            <input className="inp" style={{ width: 210 }} placeholder="Search…" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <select className="inp" style={{ width: 120 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
              <option value="all">All</option><option value="income">Income</option><option value="expense">Expenses</option>
            </select>
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon="records" title="No records yet"
            action={<button className="btn btn-primary" onClick={() => document.querySelector<HTMLInputElement>('input.inp')?.focus()}>Add your first transaction</button>}>
            Import a CSV from your bank/bookkeeping, or add entries above. MSMEs must keep books of account — from 2026 this is strictly enforced.
          </EmptyState>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr><th>Date</th><th>Description</th><th>Category</th><th>Party</th><th>VAT</th><th className="num">WHT</th><th className="num">Amount</th><th className="no-print" /></tr>
              </thead>
              <tbody>
                {rows.slice(0, 200).map((t) => (
                  <tr key={t.id}>
                    <td className="mono" style={{ whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
                    <td>{t.description}{t.nonDeductible && <span className="chip gold" style={{ marginLeft: 6 }}>capital</span>}</td>
                    <td className="small dim">{t.category}</td>
                    <td className="small">
                      {t.partyName || '—'}{!t.partyHasTIN && <span className="chip red" style={{ marginLeft: 6 }}>no TIN</span>}
                    </td>
                    <td>{vatBadge(t)}</td>
                    <td className="num">{(t.whtRate || 0) > 0 ? `${(t.whtRate * 100).toFixed(0)}% · ${naira(t.amount * t.whtRate)}` : '—'}</td>
                    <td className="num" style={{ color: t.type === 'income' ? 'var(--green-700)' : 'var(--red)', fontWeight: 700 }}>
                      {t.type === 'income' ? '+' : '−'}{naira(t.amount)}
                    </td>
                    <td className="no-print">
                      <button className="btn btn-danger btn-sm" onClick={() => dispatch({ type: 'deleteTx', id: t.id })} title="Delete"><Icon name="trash" size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 200 && <div className="hint mt8">Showing first 200 of {rows.length} — use search/filter or export CSV.</div>}
          </div>
        )}
      </div>
    </div>
  )
}
