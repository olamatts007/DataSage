import React from 'react'
import { StoreProvider } from './state/store'
import { Layout, useHashRoute } from './components/Layout'
import Overview from './pages/Overview'
import Profile from './pages/Profile'
import Records from './pages/Records'
import Payroll from './pages/Payroll'
import Engine from './pages/Engine'
import Reports from './pages/Reports'
import CalendarPage from './pages/CalendarPage'
import Guide from './pages/Guide'

function Router() {
  const [route] = useHashRoute()
  switch (route) {
    case '#/profile': return <Profile />
    case '#/records': return <Records />
    case '#/payroll': return <Payroll />
    case '#/engine': return <Engine />
    case '#/reports': return <Reports />
    case '#/calendar': return <CalendarPage />
    case '#/guide': return <Guide />
    default: return <Overview />
  }
}

export default function App() {
  const [route] = useHashRoute()
  return (
    <StoreProvider>
      <Layout route={route}>
        <Router />
      </Layout>
    </StoreProvider>
  )
}
