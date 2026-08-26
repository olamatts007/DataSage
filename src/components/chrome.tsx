import React from 'react'

/** Skeleton shown while a lazily-loaded route chunk arrives. */
export function RouteSkeleton() {
  return (
    <div className="route-skel" aria-busy="true" aria-label="Loading">
      <div className="skel" style={{ height: 52, width: '55%' }} />
      <div className="grid g4">
        <div className="skel" style={{ height: 96 }} />
        <div className="skel" style={{ height: 96 }} />
        <div className="skel" style={{ height: 96 }} />
        <div className="skel" style={{ height: 96 }} />
      </div>
      <div className="skel" style={{ height: 300 }} />
    </div>
  )
}

interface EBState { error: Error | null }

/** App-level error boundary — one bad page never kills the session or the data. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { error: null }
  static getDerivedStateFromError(error: Error): EBState { return { error } }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[TaxSage] route error:', error, info.componentStack)
  }
  render() {
    if (this.state.error) {
      return (
        <div className="errbox">
          <h3 style={{ marginTop: 0 }}>Something went wrong on this screen</h3>
          <p className="small dim">Your records are safe — they're stored locally. Try reloading, or open another screen from the left menu.</p>
          <pre className="mono" style={{ fontSize: 11, background: '#fff', padding: 10, borderRadius: 8, overflow: 'auto', maxHeight: 140 }}>{String(this.state.error)}</pre>
          <button className="btn btn-primary btn-sm" onClick={() => this.setState({ error: null })}>Try again</button>{' '}
          <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Reload app</button>
        </div>
      )
    }
    return this.props.children
  }
}
