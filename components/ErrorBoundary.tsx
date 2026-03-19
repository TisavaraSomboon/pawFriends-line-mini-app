"use client";

import { Component, ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
};

type State = { error: Error | null };

// React error boundaries must be class components.
// Wrap any subtree to catch unhandled render/query errors.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      return this.props.fallback ? (
        this.props.fallback(error, this.reset)
      ) : (
        <DefaultErrorFallback error={error} reset={this.reset} />
      );
    }
    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-dvh bg-[#f7f7f6] px-6 text-center gap-5">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
        <span className="material-symbols-outlined text-red-400" style={{ fontSize: 40 }}>
          error
        </span>
      </div>
      <div>
        <h2 className="text-[20px] font-bold text-[#1e293b]">
          Something went wrong
        </h2>
        <p className="text-[13px] text-[#64748b] mt-1 max-w-xs">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
      </div>
      <button
        onClick={reset}
        className="bg-[rgba(226,207,183,0.2)] border border-[#e2cfb7] text-[#1e293b] font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-[rgba(226,207,183,0.35)]"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          refresh
        </span>
        Try again
      </button>
    </div>
  );
}
