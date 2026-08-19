import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
  info: string | null
}

// React only unmounts to blank on a render-time error if nothing catches it.
// This renders the actual error on screen instead of leaving a white page,
// which is otherwise indistinguishable from "still loading" or "totally broken".
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
    this.setState({ info: info.componentStack ?? null })
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', color: '#fca5a5', background: '#0b1220', minHeight: '100vh' }}>
          <h1 style={{ color: '#fff', fontSize: 18 }}>Something broke while rendering this page</h1>
          <p style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{this.state.error.message}</p>
          <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.8 }}>{this.state.error.stack}</pre>
          {this.state.info && (
            <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.6 }}>{this.state.info}</pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
