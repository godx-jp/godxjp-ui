import * as React from "react";
import { QueryClient } from "@tanstack/react-query";

import { preloadStory, type StoryEntry } from "./preview-catalog";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity, gcTime: 0 },
  },
});

type ErrorBoundaryState = { error: Error | null };

export class StoryErrorBoundary extends React.Component<
  { storyId: string; children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(prev: { storyId: string }) {
    if (prev.storyId !== this.props.storyId && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="preview-runtime-error">
          <strong>Preview render failed</strong>
          <pre>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

export function useLazyStory(entry: StoryEntry | undefined) {
  const [Render, setRender] = React.useState<React.ComponentType | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sourceVersion, setSourceVersion] = React.useState(0);

  React.useEffect(() => {
    if (!entry) {
      setRender(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setRender(null);

    preloadStory(entry)
      .then((component) => {
        if (cancelled) return;
        setRender(() => component);
        setSourceVersion((v) => v + 1);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [entry?.id]);

  return { Render, loading, error, sourceVersion };
}
