import React, { Suspense, lazy, useEffect } from 'react'
import { StoreProvider } from './state/store'
import { Layout, useHashRoute } from './components/Layout'
import { ErrorBoundary, RouteSkeleton } from './components/chrome'

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
}

function Router() {
  const [route] = useHashRoute()
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
    default: page = <Overview />
  }
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <ErrorBoundary>{page}</ErrorBoundary>
    </Suspense>
  )
}

export default function App() {
  const [route] = useHashRoute()
  return (
    <StoreProvider>
      <ErrorBoundary>
        <Layout route={route}>
          <Router />
        </Layout>
      </ErrorBoundary>
    </StoreProvider>
  )
}
