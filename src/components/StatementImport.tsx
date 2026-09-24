import React, { useMemo, useRef, useState } from 'react'
import { Transaction, TxType } from '../lib/types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/rules'
import { naira, fmtDate, uid } from '../lib/format'
import {
  BANK_PRESETS, ColMap, StatementRow, autoMap, detectPreset, parseStatement, sniffHeader, suggestFor,
} from '../lib/ingest'
import { Icon, Notice } from './ui'

/**
 * Bank / fintech statement → ledger wizard.
 * file → sniff headers → preset detection → (manual mapping if needed) →
 * preview with transparent keyword suggestions + duplicate guards → import.
 */
export default function StatementImport({
  existing,
  remaining,
  onImport,
  onLockedFeature,
}: {
  existing: Transaction[]
  remaining: number // Infinity on premium
  onImport: (txs: Transaction[]) => void
  onLockedFeature?: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [text, setText] = useState('')
  const [presetKey, setPresetKey] = useState<string | null>(null)
  const [map, setMap] = useState<ColMap | null>(null)
  const [manualMap, setManualMap] = useState<ColMap>({ date: 0, desc: 1, credit: 2, debit: 3, amount: -1 })
  const [rows, setRows] = useState<StatementRow[] | null>(null)
  const [parseError, setParseError] = useState<string[]>([])
  const [skip, setSkip] = useState<Record<string, boolean>>({})
  const [cat, setCat] = useState<Record<string, string>>({})
  const [done, setDone] = useState<number | null>(null)
  const locked = onLockedFeature && remaining <= 0

  const activeMap = map ?? null

  const reset = () => {
    setFileName(''); setHeaders([]); setText(''); setPresetKey(null); setMap(null)
    setRows(null); setParseError([]); setSkip({}); setCat({}); setDone(null)
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) { onLockedFeature?.(); e.target.value = ''; return }
    const f = e.target.files?.[0]
    if (!f) return
    f.text().then((t) => {
      setText(t)
      setFileName(f.name)
      const h = sniffHeader(t)
      setHeaders(h)
      const preset = detectPreset(h)
      setPresetKey(preset?.key ?? null)
      const auto = autoMap(h, preset)
      setMap(auto)
      if (auto) {
        const { rows, errors } = parseStatement(t, auto)
        stage(t, rows, errors)
      } else {
        setRows(null)
        setParseError([])
      }
    })
    e.target.value = ''
  }

  const stage = (textNow: string, parsed: StatementRow[], errors: string[]) => {
    setRows(parsed)
    setParseError(errors)
    // pre-skip near-duplicates already in the ledger (same date + amount)
    const existingKeys = new Set(existing.map((t) => `${t.date}|${t.type}|${Math.round(t.amount)}`))
    const skipInit: Record<string, boolean> = {}
    const catInit: Record<string, string> = {}
    for (const r of parsed) {
      const k = `${r.date}|${r.type}|${Math.round(r.amount)}`
      if (existingKeys.has(k)) skipInit[r.id] = true
      catInit[r.id] = r.suggestion.category
    }
    setSkip(skipInit)
    setCat(catInit)
    setDone(null)
    void textNow
  }

  const recat = (row: StatementRow, category: string) => {
    setCat((c) => ({ ...c, [row.id]: category }))
  }

  const applyManual = () => {
    const { date, desc, credit, debit, amount } = manualMap
    if (date < 0 || desc < 0 || (credit < 0 && debit < 0 && amount < 0)) {
      setParseError(['Map at least Date, Narration and one of Credit/Debit or a signed Amount column.'])
      return
    }
    const m: ColMap = { date, desc, credit, debit, amount }
    setMap(m)
    const { rows, errors } = parseStatement(text, m)
    stage(text, rows, errors)
  }

  const chosen = useMemo(() => (rows ?? []).filter((r) => !skip[r.id]), [rows, skip])
  const dupes = useMemo(() => (rows ?? []).length - chosen.length, [rows, chosen])
  const exceeds = isFinite(remaining) && chosen.length > remaining

  const doImport = () => {
    if (!rows || chosen.length === 0) return
    const capped = isFinite(remaining) ? chosen.slice(0, remaining) : chosen
    const txs: Transaction[] = capped.map((r) => {
      const table = r.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
      const preset = table.find((c) => c.name === (cat[r.id] ?? r.suggestion.category))
      return {
        id: uid(),
        date: r.date,
        type: r.type as TxType,
        category: preset?.name ?? r.suggestion.category,
        description: r.desc,
        amount: r.amount,
        vat: preset?.vat ?? r.suggestion.vat,
        whtRate: r.suggestion.whtRate,
        partyName: '',
        partyHasTIN: true,
        nonDeductible: r.suggestion.nonDeductible && r.type === 'expense',
        isDisposal: false,
        costBasis: 0,
      }
    })
    onImport(txs)
    setDone(txs.length)
  }

  const colSelect = (label: string, val: number, key: keyof ColMap, allowNone = false) => (
    <div>
      <label className="lab">{label}</label>
      <select className="inp" value={val} onChange={(e) => setManualMap((m) => ({ ...m, [key]: Number(e.target.value) }))}>
        {allowNone && <option value={-1}>— not present —</option>}
        {headers.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
      </select>
    </div>
  )

  const catOptions = (row: StatementRow) => (row.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)

  return (
    <div className="card card-pad mb16 no-print">
      <div className="flex-between mb8">
        <div>
          <h3 className="card-title row" style={{ gap: 8 }}>
            <Icon name="building" size={15} /> Import bank / fintech statement
            <span className="chip blue">BETA</span>
          </h3>
          <p className="card-sub">
            CSV exports from <b>Moniepoint, Kuda, GTBank, OPay/PalmPay</b> and most bank portals. We detect the format,
            you confirm each row's category before anything lands in the ledger — nothing is imported silently.
          </p>
        </div>
        {(rows || fileName) && <button className="btn btn-ghost btn-sm" onClick={reset}><Icon name="refresh" size={13} /> Start over</button>}
      </div>

      {done !== null ? (
        <Notice tone="green" title={`${done} transaction(s) imported from ${fileName}`}>
          Review them in the ledger below — dates, VAT treatment and counterparty TIN flags may still need a second look.
        </Notice>
      ) : !fileName ? (
        <div className="row wrap">
          <button className="btn btn-primary" onClick={() => (locked ? onLockedFeature?.() : fileRef.current?.click())}>
            <Icon name="upload" size={14} /> Choose statement CSV…
          </button>
          <span className="hint">Exports quoted as Excel/PDF? In your bank app choose “Download statement (CSV)” first.</span>
          <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" style={{ display: 'none' }} onChange={onFile} />
        </div>
      ) : (
        <>
          <div className="row wrap mb8">
            <span className="chip dark">{fileName}</span>
            {presetKey
              ? <span className="chip green"><Icon name="check" size={11} /> Detected: {BANK_PRESETS.find((b) => b.key === presetKey)?.label}</span>
              : map
                ? <span className="chip blue">Generic format</span>
                : <span className="chip amber">Format not recognised — map the columns</span>}
          </div>

          {!map && (
            <div className="bank-box mb16">
              <div className="small mb8" style={{ fontWeight: 700 }}>Tell us which column is which</div>
              <div className="frow" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                {colSelect('Date *', manualMap.date, 'date')}
                {colSelect('Narration / description *', manualMap.desc, 'desc')}
                {colSelect('Credit (money in)', manualMap.credit, 'credit', true)}
                {colSelect('Debit (money out)', manualMap.debit, 'debit', true)}
                {colSelect('OR signed Amount', manualMap.amount, 'amount', true)}
              </div>
              <button className="btn btn-primary btn-sm mt8" onClick={applyManual}>Apply mapping <Icon name="arrow" size={13} /></button>
            </div>
          )}

          {parseError.length > 0 && <div className="mb8"><Notice tone="amber">{parseError.map((e, i) => <div key={i}>{e}</div>)}</Notice></div>}

          {rows && rows.length > 0 && (
            <>
              <div className="flex-between mb8">
                <div className="small">
                  <b>{chosen.length}</b> to import
                  {dupes > 0 && <> · <span className="dim">{dupes} skipped (possible duplicates — already in ledger)</span></>}
                </div>
                <div className="small dim">Keyword categories are suggestions — correct any before importing.</div>
              </div>
              <div style={{ overflowX: 'auto', maxHeight: 340, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 12 }}>
                <table className="tbl">
                  <thead>
                    <tr><th style={{ width: 34 }}></th><th>Date</th><th>Narration</th><th>Type</th><th className="num">Amount</th><th>Category</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} style={skip[r.id] ? { opacity: 0.45 } : undefined}>
                        <td>
                          <input type="checkbox" checked={!skip[r.id]} onChange={(e) => setSkip((s) => ({ ...s, [r.id]: !e.target.checked }))} aria-label="Include row" />
                        </td>
                        <td className="mono" style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</td>
                        <td className="small">{r.desc.length > 64 ? r.desc.slice(0, 64) + '…' : r.desc}</td>
                        <td>{skip[r.id] ? <span className="chip">skipped</span> : <span className={`chip ${r.type === 'income' ? 'green' : 'red'}`}>{r.type}</span>}</td>
                        <td className="num">{naira(r.amount)}</td>
                        <td>
                          <select className="inp" style={{ padding: '4px 8px', fontSize: 12, width: 240 }} value={cat[r.id] ?? r.suggestion.category} onChange={(e) => recat(r, e.target.value)} disabled={!!skip[r.id]}>
                            {catOptions(r).map((c) => <option key={c.name}>{c.name}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {exceeds && (
                <div className="mt8">
                  <Notice tone="amber">Free plan has <b>{remaining}</b> record slot(s) left — the oldest extra rows will be left out, or upgrade for unlimited imports.</Notice>
                </div>
              )}
              <div className="row mt16 wrap">
                <button className="btn btn-primary" onClick={doImport} disabled={chosen.length === 0}>
                  <Icon name="check" size={14} /> Import {isFinite(remaining) && chosen.length > remaining ? remaining : chosen.length} transaction(s)
                </button>
                <button className="btn btn-ghost" onClick={reset}>Cancel</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
