import { Component, type ErrorInfo, type ReactNode } from 'react';

export class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ETERNITY UI error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-dvh bg-dark-bg text-dark-textPrimary flex items-center justify-center p-6">
          <div className="max-w-md text-center rounded-2xl border border-dark-border bg-dark-card p-6">
            <h1 className="font-display text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-dark-textSecondary mt-2 leading-relaxed">Your wallet was not asked to sign anything. Reload the interface and try again.</p>
            <button type="button" onClick={() => window.location.reload()} className="min-h-11 px-5 mt-5 rounded-xl bg-primary-500 text-white text-sm font-bold focus-ring">Reload DApp</button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
