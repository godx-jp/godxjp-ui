import "./preload-recovery";
import "./preview-tailwind.css";
import "./isolate.css";

import * as React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { AppProvider } from "../../src/app/app-provider";
import { LandmarkRoot } from "./landmark-root";
import { STORY_MAP } from "./preview-catalog";
import { queryClient, StoryErrorBoundary, useLazyStory } from "./preview-runtime";

function parseStoryId(): string {
  const match = window.location.pathname.match(/\/isolate\/(.+?)\/?$/);
  if (!match?.[1]) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function IsolateApp() {
  const storyId = parseStoryId();
  const story = STORY_MAP.get(storyId);
  const { Render, loading, error } = useLazyStory(story);

  if (!storyId || !story) {
    return (
      <div className="preview-runtime-error">
        <strong>Preview not found</strong>
        <p>Unknown id: {storyId || "(empty)"}</p>
      </div>
    );
  }

  if (loading) {
    return <div className="preview-runtime-loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="preview-runtime-error">
        <strong>Failed to load demo</strong>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!Render) return null;
  const sp = new URLSearchParams(window.location.search);
  const rtl = sp.get("rtl") === "1";
  // `?theme=dark` — the SAME switch /frame/** has always honoured. It was read nowhere here, so
  // every `/isolate/<id>?theme=dark` in a gate's route list silently audited the LIGHT theme a
  // second time: two of check:contrast's eleven routes were duplicates of the two before them and
  // nobody had ever measured a dark surface through this entry point. Same failure shape as the
  // "Showcase not found" routes that gate already learned about — a query string that resolves to
  // nothing reports success on a page that was never the page under test.
  const theme = sp.get("theme") === "dark" ? "dark" : "light";

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {/* Demos are authored in Japanese; force ja so component chrome (search/clear/empty
            placeholders via t()) matches the demo copy instead of the AppProvider vi default. */}
        <AppProvider defaultLocale="ja" theme={theme} persist={false}>
          {/* `<main>` vs `<div>` is decided at runtime by probing the rendered story for an
              own `<main>` — the SAME detector `/frame/**` uses. It replaced a hardcoded
              story-id allowlist that had drifted behind the catalog and was double-wrapping
              every shell story added after it was written. See landmark-root.tsx. */}
          <LandmarkRoot
            dir={rtl ? "rtl" : undefined}
            lang={rtl ? "ar" : undefined}
            data-rtl-root={rtl ? "" : undefined}
          >
            <StoryErrorBoundary storyId={story.id}>
              <Render />
            </StoryErrorBoundary>
          </LandmarkRoot>
        </AppProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");

createRoot(container).render(
  <React.StrictMode>
    <IsolateApp />
  </React.StrictMode>,
);
