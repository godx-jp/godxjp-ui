import "./preload-recovery";
import "./preview-tailwind.css";
import "./isolate.css";

import * as React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { AppProvider } from "../../src/app/app-provider";
import { parseShowcaseId, SHOWCASE_MAP } from "./showcase-catalog";
import { queryClient, StoryErrorBoundary } from "./preview-runtime";

function useShowcaseComponent(id: string) {
  const entry = id ? SHOWCASE_MAP.get(id) : undefined;
  const [Comp, setComp] = React.useState<React.ComponentType | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(Boolean(entry));

  React.useEffect(() => {
    if (!entry) return;
    let alive = true;
    setLoading(true);
    setError(null);
    entry
      .load()
      .then((mod) => {
        if (!alive) return;
        if (!mod.default) throw new Error(`Showcase "${entry.id}" must default-export a component`);
        setComp(() => mod.default);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [entry]);

  return { entry, Comp, error, loading };
}

function ShowcaseApp() {
  const id = parseShowcaseId(window.location.pathname);
  const { entry, Comp, error, loading } = useShowcaseComponent(id);

  if (!entry) {
    return (
      <div className="preview-runtime-error">
        <strong>Showcase not found</strong>
        <p>Unknown id: {id || "(empty)"}</p>
        <p>
          <a href="/#/get-started">← Back to Get Started</a>
        </p>
      </div>
    );
  }

  if (loading) return <div className="preview-runtime-loading">Loading…</div>;

  if (error) {
    return (
      <div className="preview-runtime-error">
        <strong>Failed to load showcase</strong>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!Comp) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AppProvider persist={false}>
          <StoryErrorBoundary storyId={entry.id}>
            <Comp />
          </StoryErrorBoundary>
        </AppProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");

createRoot(container).render(
  <React.StrictMode>
    <ShowcaseApp />
  </React.StrictMode>,
);
