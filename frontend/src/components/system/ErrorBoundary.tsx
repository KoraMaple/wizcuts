'use client';

import * as React from 'react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
};

type ErrorBoundaryState = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Optionally log to an error reporting service
    // console.error("ErrorBoundary caught", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (typeof fallback === 'function')
        return fallback(this.state.error as Error);
      if (fallback) return fallback;
      return (
        <div className="m-4 rounded-md border border-error-600/40 bg-error-600/10 p-4 text-sm text-error-100">
          <div className="font-semibold">Something went wrong.</div>
          <div className="opacity-90">
            Please try again or refresh the page.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
