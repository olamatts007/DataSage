import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { AppState, BusinessProfile, Employee, FilingRecord, Transaction } from '../lib/types'
import { emptyState, smallFoodsScenario, solePropScenario, standardTradingScenario } from '../lib/sample'

const KEY = 'taxsage.v1'

type Action =
  | { type: 'setProfile'; profile: Partial<BusinessProfile> }
  | { type: 'onboarded' }
  | { type: 'addTx'; tx: Transaction }
  | { type: 'addManyTx'; txs: Transaction[] }
  | { type: 'deleteTx'; id: string }
  | { type: 'addEmployee'; e: Employee }
  | { type: 'updateEmployee'; e: Employee }
  | { type: 'deleteEmployee'; id: string }
  | { type: 'setFilings'; f: FilingRecord[] }
  | { type: 'setYear'; year: number }
  | { type: 'load'; state: AppState }

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'setProfile': return { ...s, profile: { ...s.profile, ...a.profile } }
    case 'onboarded': return { ...s, onboarded: true }
    case 'addTx': return { ...s, transactions: [...s.transactions, a.tx] }
    case 'addManyTx': return { ...s, transactions: [...s.transactions, ...a.txs] }
    case 'deleteTx': return { ...s, transactions: s.transactions.filter((t) => t.id !== a.id) }
    case 'addEmployee': return { ...s, employees: [...s.employees, a.e] }
    case 'updateEmployee': return { ...s, employees: s.employees.map((e) => (e.id === a.e.id ? a.e : e)) }
    case 'deleteEmployee': return { ...s, employees: s.employees.filter((e) => e.id !== a.id) }
    case 'setFilings': return { ...s, filings: a.f }
    case 'setYear': return { ...s, year: a.year }
    case 'load': return a.state
  }
}

interface Store {
  state: AppState
  dispatch: React.Dispatch<Action>
  loadSample: (which: 'small' | 'standard' | 'soleprop') => void
  reset: () => void
}

const Ctx = createContext<Store | null>(null)

function loadInitial(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (parsed && parsed.profile && Array.isArray(parsed.transactions)) return parsed
    }
  } catch { /* corrupted storage → start fresh */ }
  return smallFoodsScenario() // first-run: showcase a realistic small company
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage full/blocked */ }
  }, [state])

  const api = useMemo<Store>(
    () => ({
      state,
      dispatch,
      loadSample: (which) =>
        dispatch({
          type: 'load',
          state: which === 'small' ? smallFoodsScenario() : which === 'standard' ? standardTradingScenario() : solePropScenario(),
        }),
      reset: () => dispatch({ type: 'load', state: emptyState() }),
    }),
    [state]
  )

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}

// derived engine bundle — computed once per state change
import { annualTotals, classify } from '../lib/engine'
import { NTA2025, FA2021 } from '../lib/rules'

export function useEngine() {
  const { state } = useStore()
  return useMemo(() => {
    const totals = annualTotals(state.transactions, state.year, state.profile.fyEndMonth)
    const cls = classify(state.profile, totals, NTA2025)
    const clsOld = classify(state.profile, totals, FA2021)
    return { totals, classification: cls, classificationOld: clsOld, rules: NTA2025, rulesOld: FA2021 }
  }, [state])
}
