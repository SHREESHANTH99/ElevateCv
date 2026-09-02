import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d1110] flex flex-col items-center justify-center p-4">
          <div className="glass-card rounded-lg p-8 max-w-md w-full text-center border-rose-500/20">
            <div className="w-16 h-16 bg-rose-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-3">Something went wrong</h1>
            <p className="text-zinc-400 mb-8 text-sm">
              We encountered an unexpected error. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
