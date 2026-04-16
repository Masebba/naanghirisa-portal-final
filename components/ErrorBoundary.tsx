import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown) {
    console.error('Application error boundary caught an error:', error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-black text-slate-900 mb-3">Something went wrong</h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              The portal could not render this page. Please refresh the page or sign in again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
