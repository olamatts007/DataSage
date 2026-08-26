import { Transaction, VatTreatment } from './types'
import { uid } from './format'

const HEAD = 'date,type,category,description,amount,vat,wht_rate,party_name,party_has_tin,non_deductible'

export function transactionsToCSV(txs: Transaction[]): string {
  const esc = (s: string) => `"${s.replaceAll('"', '""')}"`
  const rows = txs.map((t) =>
    [
      t.date, t.type, esc(t.category), esc(t.description), t.amount,
      t.vat, t.whtRate ?? 0, esc(t.partyName ?? ''), t.partyHasTIN ? 'yes' : 'no',
      t.nonDeductible ? 'yes' : 'no',
    ].join(',')
  )
  return [HEAD, ...rows].join('\n')
}

export function parseTransactionsCSV(text: string): { txs: Transaction[]; errors: string[] } {
  const errors: string[] = []
  const txs: Transaction[] = []
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { txs, errors: ['File is empty'] }

  // naive-but-safe CSV: handles quoted commas
  const split = (line: string): string[] => {
    const out: string[] = []
    let cur = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (inQ) {
        if (c === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++ } else inQ = false
        } else cur += c
      } else {
        if (c === '"') inQ = true
        else if (c === ',') { out.push(cur); cur = '' }
        else cur += c
      }
    }
    out.push(cur)
    return out.map((s) => s.trim())
  }

  const data = lines[0].toLowerCase().includes('date') ? lines.slice(1) : lines
  data.forEach((line, idx) => {
    const c = split(line)
    if (c.length < 5) { errors.push(`Row ${idx + 2}: not enough columns`); return }
    const [date, type, category, description, amountS, vatS, whtS, party, tinSu, ndS] = c
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { errors.push(`Row ${idx + 2}: date must be yyyy-mm-dd`); return }
    if (type !== 'income' && type !== 'expense') { errors.push(`Row ${idx + 2}: type must be income|expense`); return }
    const amount = Number(amountS)
    if (!isFinite(amount) || amount <= 0) { errors.push(`Row ${idx + 2}: invalid amount`); return }
    const vat: VatTreatment = (['standard', 'zero_rated', 'exempt', 'non_vatable'] as const).includes(vatS as VatTreatment)
      ? (vatS as VatTreatment)
      : 'standard'
    txs.push({
      id: uid(),
      date, type,
      category: category || 'Other',
      description: description || '',
      amount,
      vat,
      whtRate: Number(whtS) > 0 ? Number(whtS) : 0,
      partyName: party || '',
      partyHasTIN: (tinSu || 'yes').toLowerCase() !== 'no',
      nonDeductible: (ndS || 'no').toLowerCase() === 'yes',
    })
  })
  return { txs, errors }
}

export function download(filename: string, content: string, mime = 'text/csv'): void {
  const blob = new Blob([content], { type: mime + ';charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function genericCSV(headers: string[], rows: (string | number)[][]): string {
  const esc = (s: string | number) => {
    const v = String(s)
    return /[",\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v
  }
  return [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
}
