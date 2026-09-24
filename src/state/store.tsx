import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { AppState, BusinessProfile, Employee, FilingRecord, Transaction } from '../lib/types'
import { emptyState, smallFoodsScenario, solePropScenario, standardTradingScenario } from '../lib/sample'
import {
  Entitlement, FREE_SUB, Payment, Period, Subscription, computeEntitlement,
  paymentRef, periodEnd, trialEnd, PLANS,
} from '../lib/billing'
import { AccessCode, GateMode, mergeCodes } from '../lib/access'

const KEY = 'taxsage.v1'

/** minimal registry entry for one business's workspace */
export interface WorkspaceMeta { id: string; createdAt: string }
/** the per-business payload (everything that belongs to ONE business) */
export interface WorkspaceData {
  profile: BusinessProfile
  transactions: Transaction[]
  employees: Employee[]
  filings: FilingRecord[]
  year: number
  onboarded: boolean
}

export interface PersistedState extends AppState {
  subscription: Subscription
  payments: Payment[]
  accessCodes: AccessCode[]
  /** access-gate mode for this device/deployment */
  gateMode: GateMode
  /** true once the user toggles the mode locally — provisioning no longer overrides it */
  gateOverride: boolean
  /** ISO timestamp of the last JSON backup export — '' = never backed up */
  lastBackupAt: string
  /** multi-business workspaces (accountant mode) — subscription/access codes stay device-global */
  workspaces: WorkspaceMeta[]
  workspacesData: Record<string, WorkspaceData>
  activeWorkspaceId: string
}

/** snapshot the business-scoped fields of the live state into a workspace record */
function captureWs(s: PersistedState): WorkspaceData {
  return {
    profile: s.profile,
    transactions: s.transactions,
    employees: s.employees,
    filings: s.filings,
    year: s.year,
    onboarded: s.onboarded,
  }
}

const emptyWs = (): WorkspaceData => {
  const e = emptyState()
  return { profile: e.profile, transactions: [], employees: [], filings: [], year: e.year, onboarded: e.onboarded }
}

const MAIN_WS = 'ws-main'

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
  | { type: 'seedProvision'; codes: AccessCode[]; gate: GateMode | null }
  | { type: 'setGateMode'; mode: GateMode }
  | { type: 'recordBackup' }
  | { type: 'addWorkspace'; id: string }
  | { type: 'switchWorkspace'; id: string }
  | { type: 'deleteWorkspace'; id: string }

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
    case 'seedProvision':
      return {
        ...s,
        accessCodes: mergeCodes(s.accessCodes, a.codes),
        gateMode: s.gateOverride || a.gate === null ? s.gateMode : a.gate,
      }
    case 'setGateMode':
      return { ...s, gateMode: a.mode, gateOverride: true }
    case 'recordBackup':
      return { ...s, lastBackupAt: now.toISOString() }

    // ── workspaces (accountant mode): business data hops between slots ──────
    case 'addWorkspace': {
      const saved = { ...s.workspacesData, [s.activeWorkspaceId]: captureWs(s) }
      const fresh = emptyWs()
      return {
        ...s,
        ...fresh,
        workspaces: [...s.workspaces, { id: a.id, createdAt: now.toISOString() }],
        workspacesData: saved,
        activeWorkspaceId: a.id,
      }
    }
    case 'switchWorkspace': {
      if (a.id === s.activeWorkspaceId || !s.workspaces.some((w) => w.id === a.id)) return s
      const saved = { ...s.workspacesData, [s.activeWorkspaceId]: captureWs(s) }
      const target = saved[a.id] ?? emptyWs()
      return { ...s, ...target, workspacesData: saved, activeWorkspaceId: a.id }
    }
    case 'deleteWorkspace': {
      // never delete the active or the last remaining workspace
      if (a.id === s.activeWorkspaceId || s.workspaces.length <= 1) return s
      const rest = { ...s.workspacesData }
      delete rest[a.id]
      return { ...s, workspaces: s.workspaces.filter((w) => w.id !== a.id), workspacesData: rest }
    }
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
    transactions: (parsed.transactions ?? []).map((t) => ({ isDisposal: false, costBasis: 0, ...(t as Partial<Transaction>) }) as Transaction),
    // schema migration: employees gained annualRent/nhf/nhisAmount/benefitsInKind —
    // persisted records predating the fields are backfilled with neutral values
    employees: (parsed.employees ?? []).map((e) => ({ annualRent: 0, nhf: false, nhisAmount: 0, benefitsInKind: 0, ...(e as Partial<Employee>) }) as Employee),
    filings: parsed.filings ?? [],
    subscription: { ...FREE_SUB, ...(parsed.subscription ?? {}) },
    payments: parsed.payments ?? [],
    accessCodes: parsed.accessCodes ?? [],
    gateMode: parsed.gateMode ?? 'code',
    gateOverride: parsed.gateOverride ?? false,
    lastBackupAt: parsed.lastBackupAt ?? '',
    // workspace migration: pre-v3 single-business installs become the MAIN slot;
    // stored workspace payloads pass through the same field-level migration
    workspaces: parsed.workspaces?.length ? parsed.workspaces : [{ id: MAIN_WS, createdAt: new Date().toISOString() }],
    workspacesData: Object.fromEntries(
      Object.entries(parsed.workspacesData ?? {}).map(([id, d]) => [
        id,
        {
          ...d,
          profile: { ...emptyState().profile, ...(d.profile ?? {}) },
          transactions: (d.transactions ?? []).map((t) => ({ isDisposal: false, costBasis: 0, ...(t as Partial<Transaction>) }) as Transaction),
          employees: (d.employees ?? []).map((e) => ({ annualRent: 0, nhf: false, nhisAmount: 0, benefitsInKind: 0, ...(e as Partial<Employee>) }) as Employee),
          filings: d.filings ?? [],
          year: d.year ?? emptyState().year,
          onboarded: d.onboarded ?? false,
        },
      ])
    ),
    activeWorkspaceId:
      parsed.activeWorkspaceId && parsed.workspaces?.some((w) => w.id === parsed.activeWorkspaceId)
        ? parsed.activeWorkspaceId
        : parsed.workspaces?.[0]?.id ?? MAIN_WS,
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
