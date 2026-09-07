import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

/** Catches render-time crashes so users see a friendly recovery screen instead of a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  private reset = () => this.setState({ hasError: false, message: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-sm w-full text-center space-y-4">
          <div
            className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto"
            aria-hidden="true"
          >
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Something went wrong</h1>
          <p className="font-body text-sm text-muted-foreground">
            This page couldn't load properly. Try again, or head back to the home screen.
          </p>
          <div className="flex gap-2 justify-center pt-1">
            <Button onClick={this.reset} className="rounded-full gap-2">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Try again
            </Button>
            <Button
              variant="outline"
              className="rounded-full gap-2"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <Home className="h-4 w-4" aria-hidden="true" /> Home
            </Button>
          </div>
        </div>
      </main>
    );
  }
}
