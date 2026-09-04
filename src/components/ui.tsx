import React from 'react'

// ── inline SVG icon set (stroke style, 24px grid) ───────────────────────────
const paths: Record<string, string> = {
  dash: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  profile: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  records: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  payroll: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  engine: 'M12 2a10 10 0 1 0 10 10 M12 12 L12 6 M12 12 L17 17 M21.12 15 A9 9 0 1 1 12 3',
  reports: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 15l2 2 4-4',
  calendar: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  guide: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  plus: 'M12 5v14 M5 12h14',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  print: 'M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z',
  trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  check: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01',
  naira: 'M4 20V4l16 16V4 M2 9h20 M2 15h20',
  scale: 'M12 3v18 M8 21h8 M5 7l7-4 7 4 M3 13a2 2 0 0 0 4 0L5 7l-2 6z M17 13a2 2 0 0 0 4 0l-2-6-2 6z',
  building: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18 M2 22h20 M9 6h1 M9 10h1 M9 14h1 M14 6h1 M14 10h1 M14 14h1 M12 22v-4',
  coins: 'M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z M18.09 10.37A6 6 0 1 1 10.34 18 M7 6h1v4 M16.71 13.88l.7.71-2.82 2.82',
  arrow: 'M5 12h14 M12 5l7 7-7 7',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  sparkles: 'M12 3l1.9 5.8 5.8 1.9-5.8 1.9L12 18.4l-1.9-5.8L4.3 10.7l5.8-1.9L12 3z M19 2v4 M21 4h-4 M5 17v4 M7 19H3',
  chevron: 'M6 9l6 6 6-6',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
}

export function Icon({ name, size = 17 }: { name: keyof typeof paths | string; size?: number }) {
  const d = paths[name] ?? paths.info
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

export function Stat({
  k, v, s, tone,
}: { k: string; v: React.ReactNode; s?: React.ReactNode; tone?: 'accent' | 'gold' | 'plain' }) {
  return (
    <div className={`card stat ${tone === 'accent' ? 'accent' : tone === 'gold' ? 'gold-a' : ''}`}>
      <div className="k">{k}</div>
      <div className="v">{v}</div>
      {s && <div className="s">{s}</div>}
    </div>
  )
}

export function Notice({ tone, title, children }: { tone: 'green' | 'amber' | 'red' | 'blue'; title?: string; children: React.ReactNode }) {
  const icon = tone === 'green' ? 'check' : tone === 'blue' ? 'info' : 'alert'
  return (
    <div className={`notice ${tone}`}>
      <span style={{ flex: '0 0 auto', marginTop: 1 }}><Icon name={icon} size={16} /></span>
      <div>
        {title && <div className="ttl">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  )
}

export function Meter({ value, max, color, warn }: { value: number; max: number; color?: string; warn?: boolean }) {
  const p = Math.min(100, (value / max) * 100)
  const c = color ?? (warn ? '#e2725b' : 'var(--green-600)')
  return (
    <div className="meter">
      <div style={{ width: `${p}%`, background: c }} />
    </div>
  )
}

export function PageHead({ title, sub, right }: { title: string; sub?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="page-head flex-between">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {right && <div className="row">{right}</div>}
    </div>
  )
}

export function EmptyState({ icon, title, children, action }: { icon: string; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="center" style={{ padding: '44px 20px', color: 'var(--ink-2)' }}>
      <div style={{ color: 'var(--ink-3)', marginBottom: 10 }}><Icon name={icon} size={34} /></div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{title}</div>
      {children && <div className="small" style={{ maxWidth: 420, margin: '0 auto' }}>{children}</div>}
      {action && <div className="mt16">{action}</div>}
    </div>
  )
}

export function PrintHeader({ business, title, basis }: { business: string; title: string; basis: string }) {
  return (
    <div className="print-header">
      <div className="flex-between">
        <div>
          <div className="l">TaxSage · {business}</div>
          <div className="r">{title}</div>
        </div>
        <div className="r right">
          <div>{basis}</div>
          <div>Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
    </div>
  )
}

export function ReportFooter() {
  return (
    <div className="hint mt16" style={{ fontSize: 10.5 }}>
      <b>Preparation schedule only.</b> TaxSage outputs are working schedules to support your filings on the Nigeria Revenue
      Service (NRS) e-portal and your State Internal Revenue Service — they are not filed returns. Figures are computed from the
      records you entered under the Nigeria Tax Act 2025 and Nigeria Tax Administration Act 2025 (effective 1 January 2026).
      Consult a licensed tax practitioner for audit-facing submissions.
    </div>
  )
}
