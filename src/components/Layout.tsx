import React, { useEffect, useState } from 'react'
import { useStore, useEngine } from '../state/store'
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

export function Layout({ children, route }: { children: React.ReactNode; route: string }) {
  const { state, loadSample, reset } = useStore()
  const { classification } = useEngine()
  const [menu, setMenu] = useState(false)
  const page = ROUTES.flatMap((g) => g.items).find((i) => i.hash === route)
  const isCompany = state.profile.structure === 'limited_company'

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><span className="logo">₦</span> TaxSage</div>
          <div className="brand-sub">MSME tax compliance under the Nigeria Tax Act 2025 · effective 1 Jan 2026</div>
        </div>
        <nav className="nav">
          {ROUTES.map((g) => (
            <React.Fragment key={g.group}>
              <div className="nav-label">{g.group}</div>
              {g.items.map((i) => (
                <a key={i.hash} href={i.hash} className={route === i.hash ? 'active' : ''}>
                  <Icon name={i.icon} /> {i.label}
                </a>
              ))}
            </React.Fragment>
          ))}
        </nav>
        <div className="sidebar-foot">
          Nigeria Tax Act · Tax Administration Act · NRS Act · Joint Revenue Board Act (2025).
          Rates & thresholds as gazetted, effective 1 January 2026.
        </div>
      </aside>

      <div className="main">
        <div className="topbar no-print">
          <h1>{page?.label ?? 'TaxSage'}</h1>
          <div className="spacer" />
          <PlanBadge />
          <span className={`chip ${classification.isSmall ? 'green' : 'blue'}`}>
            {state.profile.name ? state.profile.name : 'Unnamed business'} · {classification.isSmall ? 'SMALL COMPANY — 0% CIT' : isCompany ? 'STANDARD COMPANY' : state.profile.structure.replace('_', ' ').toUpperCase()}
          </span>
          <span className="chip dark">FY {state.year}</span>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setMenu((m) => !m)}>
              <Icon name="refresh" size={14} /> Scenarios
            </button>
            {menu && (
              <div className="card" style={{ position: 'absolute', right: 0, top: '110%', zIndex: 50, padding: 8, width: 300 }}>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => { loadSample('small'); setMenu(false) }}>🍲 Small foods company (₦42m · 0% CIT)</button>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', marginTop: 4 }} onClick={() => { loadSample('standard'); setMenu(false) }}>🏬 Trading company (₦160m · 30% CIT)</button>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', marginTop: 4 }} onClick={() => { loadSample('soleprop'); setMenu(false) }}>🎨 Sole proprietor (PIT + rent relief)</button>
                <button className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'flex-start', marginTop: 4 }} onClick={() => { reset(); setMenu(false); window.location.hash = '#/profile' }}>✚ Start blank (your business)</button>
              </div>
            )}
          </div>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  )
}
