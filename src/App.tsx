import React, { Suspense, lazy, useEffect, useState } from 'react'
import { StoreProvider, useStore } from './state/store'
import { Layout, useHashRoute } from './components/Layout'
import { ErrorBoundary, RouteSkeleton } from './components/chrome'
import AccessGate from './components/AccessGate'
import { checkCode, isAdminAuthed, readAccessSession, writeAccessSession } from './lib/access'

// route-level code splitting — the initial chunk stays under ~90KB raw,
// each screen loads on first visit and is cached afterwards.
const Overview = lazy(() => import('./pages/Overview'))
const Profile = lazy(() => import('./pages/Profile'))
const Records = lazy(() => import('./pages/Records'))
const Payroll = lazy(() => import('./pages/Payroll'))
const Engine = lazy(() => import('./pages/Engine'))
const Reports = lazy(() => import('./pages/Reports'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const Guide = lazy(() => import('./pages/Guide'))
const Billing = lazy(() => import('./pages/Billing'))
const Admin = lazy(() => import('./pages/Admin'))

const ROUTE_TITLES: Record<string, string> = {
  '#/overview': 'Overview',
  '#/profile': 'Business Profile',
  '#/records': 'Records Ledger',
  '#/payroll': 'Payroll & PAYE',
  '#/engine': 'Tax Engine',
  '#/reports': 'Returns & Reports',
  '#/calendar': 'Filing Calendar',
  '#/guide': 'The 2025 Tax Acts',
  '#/billing': 'Subscription & Billing',
  '#/admin': 'Admin — Access Control',
}

function Router({ route }: { route: string }) {
  useEffect(() => {
    document.title = `${ROUTE_TITLES[route] ?? 'Overview'} · TaxSage`
  }, [route])

  let page: React.ReactNode
  switch (route) {
    case '#/profile': page = <Profile />; break
    case '#/records': page = <Records />; break
    case '#/payroll': page = <Payroll />; break
    case '#/engine': page = <Engine />; break
    case '#/reports': page = <Reports />; break
    case '#/calendar': page = <CalendarPage />; break
    case '#/guide': page = <Guide />; break
    case '#/billing': page = <Billing />; break
    case '#/admin': page = <Admin />; break
    default: page = <Overview />
  }
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <ErrorBoundary>{page}</ErrorBoundary>
    </Suspense>
  )
}

/** Validates a saved access session against the live code registry. */
function sessionValid(stateCodes: Parameters<typeof checkCode>[0]): string | null {
  const sess = readAccessSession()
  if (!sess) return null
  const res = checkCode(stateCodes, sess.code)
  if (res.ok) return sess.code
  // codes that have already been consumed by *this* device still hold:
  // exhausted codes stay valid for their existing session holders
  if (!res.ok && res.reason === 'exhausted') return sess.code
  writeAccessSession(null) // revoked/expired/unknown → boot back to the gate
  return null
}

function Shell() {
  const { state } = useStore()
  const [route] = useHashRoute()
  const [grantedCode, setGrantedCode] = useState<string | null>(() => sessionValid(state.accessCodes))
  const isAdmin = route.startsWith('#/admin') || isAdminAuthed()

  const gateOpen = !isAdmin && !grantedCode
  return (
    <ErrorBoundary>
      {gateOpen ? (
        <AccessGate onGranted={() => setGrantedCode(readAccessSession()?.code ?? 'ok')} />
      ) : (
        <Layout route={route}>
          <Router route={route} />
        </Layout>
      )}
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
