export const naira = (n: number, decimals = 0): string => {
  const neg = n < 0
  const abs = Math.abs(n)
  const s = abs.toLocaleString('en-NG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return `${neg ? '−' : ''}₦${s}`
}

export const num = (n: number): string =>
  n.toLocaleString('en-NG', { maximumFractionDigits: 2 })

export const pct = (n: number): string => `${(n * 100).toFixed(1)}%`

export const kfmt = (n: number): string => {
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}bn`
  if (abs >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}m`
  if (abs >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`
  return `₦${n.toFixed(0)}`
}

export const fmtDate = (iso: string): string => {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export const monthName = (ym: string): string => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export const uid = (): string => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
