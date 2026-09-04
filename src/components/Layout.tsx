import React, { useEffect, useRef, useState } from 'react'
import { useStore, useEngine, useEntitlements } from '../state/store'
import { Icon } from './ui'
import { PlanBadge } from './paywall'

export const ROUTES = [
  { group: 'Comply', items: [
    { hash: '#/overview', icon: 'dash', label: 'Overview' },
    { hash: '#/profile', icon: 'profile', label: 'Business Profile' },
    { hash: '#/calendar', icon: 'calendar', label: 'Filing Calendar' },
  ]},
  { group: 'Collate', items: [
    { hash: '#/records', icon: 'records', label: 'Records Ledger' },
    { hash: '#/payroll', icon: 'payroll', label: 'Payroll (PAYE)' },
  ]},
  { group: 'Process & Report', items: [
    { hash: '#/engine', icon: 'engine', label: 'Tax Engine' },
    { hash: '#/reports', icon: 'reports', label: 'Returns & Reports' },
  ]},
  { group: 'Reference', items: [
    { hash: '#/guide', icon: 'guide', label: 'The New Law' },
    { hash: '#/billing', icon: 'naira', label: 'Subscription' },
  ]},
  { group: 'Admin', items: [
    { hash: '#/admin', icon: 'building', label: 'Access Control' },
  ]},
]

export function useHashRoute(): [string, (h: string) => void] {
  const [hash, setHash] = useState(() => window.location.hash || '#/overview')
  useEffect(() => {
    const fn = () => setHash(window.location.hash || '#/overview')
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])
  return [hash, (h: string) => { window.location.hash = h }]
}

function SidePlanTile() {
  const ent = useEntitlements()
  if (ent.isPremiumActive) {
    return (
      <div className="side-pro no-print">
        <Icon name="shield" size={15} /> Premium active — every feature unlocked
      </div>
    )
  }
  return (
    <div className="side-upsell no-print">
      <div className="side-upsell-ttl"><Icon name="sparkles" size={14} /> TaxSage Premium</div>
      <div className="side-upsell-txt">
        Unlimited records & payroll, filed-report packs, compliance radar and deadline alarms.
      </div>
      <a className="btn btn-gold btn-sm" href="#/billing">
        Upgrade <Icon name="zap" size={13} /> from ₦7,500/mo
      </a>
    </div>
  )
}

export function Layout({ children, route }: { children: React.ReactNode; route: string }) {
  const { state, loadSample, reset } = useStore()
  const { classification } = useEngine()
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const allItems = ROUTES.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })))
  const page = allItems.find((i) => i.hash === route)
  const isCompany = state.profile.structure === 'limited_company'

  // close the scenario menu on any outside click or Escape
  useEffect(() => {
    if (!menu) return
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [menu])

  const businessChip = state.profile.name
    ? state.profile.name
    : 'Unnamed business'

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <span className="logo">₦</span>
            <span className="brand-word">TaxSage</span>
            <span className="proto-chip">Test run</span>
          </div>
          <div className="brand-sub">MSME tax compliance under the Nigeria Tax Act 2025 · effective 1 Jan 2026</div>
        </div>

        <nav className="nav" aria-label="Primary">
          {ROUTES.map((g) => (
            <React.Fragment key={g.group}>
              <div className="nav-label">{g.group}</div>
              {g.items.map((i) => (
                <a key={i.hash} href={i.hash} className={route === i.hash ? 'active' : ''} aria-current={route === i.hash ? 'page' : undefined}>
                  <Icon name={i.icon} /> {i.label}
                </a>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <SidePlanTile />

        <div className="sidebar-foot">
          Nigeria Tax Act · Tax Administration Act · NRS Act · Joint Revenue Board Act (2025).
          Rates & thresholds as gazetted, effective 1 January 2026.
        </div>
      </aside>

      <div className="main">
        <div className="topbar no-print">
          <div className="tb-title">
            <div className="overline">{page?.group ?? 'Workspace'} · FY {state.year}</div>
            <h1>{page?.label ?? 'TaxSage'}</h1>
          </div>
          <div className="spacer" />
          <div className="tb-right">
            <PlanBadge />
            <span className={`chip ${classification.isSmall ? 'green' : 'blue'}`} title="Tax classification">
              {businessChip} · {classification.isSmall ? 'SMALL — 0% CIT' : isCompany ? 'STANDARD' : state.profile.structure.replace('_', ' ').toUpperCase()}
            </span>
            <span className="chip dark">FY {state.year}</span>
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button className="btn btn-ghost btn-sm" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu">
                <Icon name="refresh" size={13} /> Scenarios <Icon name="chevron" size={12} />
              </button>
              {menu && (
                <div className="card scenario-menu" role="menu">
                  <div className="menu-label">Load demo data</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => { loadSample('small'); setMenu(false) }}>🍲 Small foods company — ₦42m · 0% CIT</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { loadSample('standard'); setMenu(false) }}>🏬 Trading company — ₦160m · 30% CIT</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { loadSample('soleprop'); setMenu(false) }}>🎨 Sole proprietor — PIT + rent relief</button>
                  <div className="menu-label">Start over</div>
                  <button className="btn btn-danger btn-sm" onClick={() => { reset(); setMenu(false); window.location.hash = '#/profile' }}>✚ Blank workspace (your business)</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="content" key={route}>{children}</div>
      </div>
    </div>
  )
}
