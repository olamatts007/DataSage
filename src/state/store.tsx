import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { AppState, BusinessProfile, Employee, FilingRecord, Transaction } from '../lib/types'
import { emptyState, smallFoodsScenario, solePropScenario, standardTradingScenario } from '../lib/sample'
import {
  Entitlement, FREE_SUB, Payment, Period, Subscription, computeEntitlement,
  paymentRef, periodEnd, trialEnd, PLANS,
} from '../lib/billing'
import { AccessCode, mergeCodes } from '../lib/access'

const KEY = 'taxsage.v1'

export interface PersistedState extends AppState {
  subscription: Subscription
  payments: Payment[]
  accessCodes: AccessCode[]
}

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
  | { type: 'load'; state: PersistedState }
  | { type: 'subscribe'; period: Period; method: Payment['method']; note: string }
  | { type: 'startTrial' }
  | { type: 'cancelSubscription' }
  | { type: 'resumeSubscription' }
  | { type: 'downgradeFree' }
  | { type: 'addAccessCode'; code: AccessCode }
  | { type: 'revokeAccessCode'; id: string }
  | { type: 'activateAccessCode'; id: string }
  | { type: 'seedAccessCodes'; codes: AccessCode[] }

function reducer(s: PersistedState, a: Action): PersistedState {
  const now = new Date()
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
    case 'startTrial':
      if (s.subscription.trialUsed) return s
      return {
        ...s,
        subscription: {
          ...s.subscription,
          status: 'trialing',
          period: 'monthly',
          trialUsed: true,
          trialEnd: trialEnd(now),
          cancelledAt: '',
        },
        payments: [...s.payments, {
          id: paymentRef(), kind: 'trial', period: 'trial', method: 'trial', amount: 0,
          date: now.toISOString(), reference: paymentRef(), note: '14-day Premium trial started',
        }],
      }
    case 'subscribe': {
      const plan = PLANS.premium(a.period)
      return {
        ...s,
        subscription: {
          status: 'active',
          period: a.period,
          currentPeriodEnd: periodEnd(now, a.period),
          trialUsed: s.subscription.trialUsed,
          trialEnd: s.subscription.trialEnd,
          autoRenew: true,
          cancelledAt: '',
        },
        payments: [...s.payments, {
          id: paymentRef(), kind: 'subscription', period: a.period, method: a.method, amount: plan.price,
          date: now.toISOString(), reference: paymentRef(), note: a.note,
        }],
      }
    }
    case 'cancelSubscription':
      return { ...s, subscription: { ...s.subscription, autoRenew: false, cancelledAt: now.toISOString() } }
    case 'resumeSubscription':
      return { ...s, subscription: { ...s.subscription, autoRenew: true, cancelledAt: '' } }
    case 'downgradeFree':
      return { ...s, subscription: { ...FREE_SUB, trialUsed: s.subscription.trialUsed, trialEnd: s.subscription.trialEnd } }
    case 'addAccessCode':
      return { ...s, accessCodes: [...s.accessCodes, a.code] }
    case 'seedAccessCodes':
      return { ...s, accessCodes: mergeCodes(s.accessCodes, a.codes) }
    case 'revokeAccessCode':
      return { ...s, accessCodes: s.accessCodes.map((c) => (c.id === a.id ? { ...c, revoked: true } : c)) }
    case 'activateAccessCode': {
      const code = s.accessCodes.find((c) => c.id === a.id)
      if (!code) return s
      const stamp = { at: now.toISOString() }
      // bestow the grant attached to the code
      if (code.grant === 'trial') {
        return {
          ...s,
          accessCodes: s.accessCodes.map((c) => (c.id === a.id ? { ...c, activations: [...c.activations, stamp] } : c)),
          subscription: {
            ...s.subscription,
            status: 'trialing',
            period: 'monthly',
            trialUsed: true,
            trialEnd: trialEnd(now),
            cancelledAt: '',
          },
          payments: [...s.payments, {
            id: paymentRef(), kind: 'grant', period: 'trial', method: 'access-code', amount: 0,
            date: now.toISOString(), reference: code.code, note: `Access grant — 14-day trial (${code.note || 'customer test run'})`,
          }],
        }
      }
      const plan = PLANS.premium(code.grant)
      return {
        ...s,
        accessCodes: s.accessCodes.map((c) => (c.id === a.id ? { ...c, activations: [...c.activations, stamp] } : c)),
        subscription: {
          status: 'active',
          period: code.grant,
          currentPeriodEnd: periodEnd(now, code.grant),
          trialUsed: s.subscription.trialUsed,
          trialEnd: s.subscription.trialEnd,
          autoRenew: false, // grant codes do not auto-bill
          cancelledAt: '',
        },
        payments: [...s.payments, {
          id: paymentRef(), kind: 'grant', period: code.grant, method: 'access-code', amount: plan.price,
          date: now.toISOString(), reference: code.code, note: `Access grant — Premium ${code.grant} (${code.note || 'customer test run'})`,
        }],
      }
    }
  }
}

interface Store {
  state: PersistedState
  dispatch: React.Dispatch<Action>
  loadSample: (which: 'small' | 'standard' | 'soleprop') => void
  reset: () => void
}

const Ctx = createContext<Store | null>(null)

/** merge persisted data with current defaults (schema migrations) */
function mergeDefaults(parsed: Partial<PersistedState>): PersistedState {
  return {
    ...emptyState(),
    ...parsed,
    profile: { ...emptyState().profile, ...(parsed.profile ?? {}) },
    transactions: parsed.transactions ?? [],
    employees: parsed.employees ?? [],
    filings: parsed.filings ?? [],
    subscription: { ...FREE_SUB, ...(parsed.subscription ?? {}) },
    payments: parsed.payments ?? [],
    accessCodes: parsed.accessCodes ?? [],
  }
}

function loadInitial(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>
      if (parsed && parsed.profile && Array.isArray(parsed.transactions)) return mergeDefaults(parsed)
    }
  } catch { /* corrupted storage → start fresh */ }
  const demo = smallFoodsScenario() // first-run: showcase a realistic small company (free tier)
  return mergeDefaults(demo)
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
      loadSample: (which) => {
        const scenario = which === 'small' ? smallFoodsScenario() : which === 'standard' ? standardTradingScenario() : solePropScenario()
        dispatch({ type: 'load', state: mergeDefaults({ ...scenario, subscription: state.subscription, payments: state.payments }) })
      },
      reset: () =>
        dispatch({ type: 'load', state: mergeDefaults({ ...emptyState(), subscription: state.subscription, payments: state.payments }) }),
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

// subscription entitlements — computed once per subscription state
export function useEntitlements(): Entitlement {
  const { state } = useStore()
  return useMemo(() => computeEntitlement(state.subscription, new Date()), [state.subscription])
}
