import "./preview-tailwind.css";
import "./isolate.css";

import * as React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { AppProvider } from "../../src/app/app-provider";
import { STORY_MAP } from "./preview-catalog";
import { queryClient, StoryErrorBoundary, useLazyStory } from "./preview-runtime";

function parseStoryId(): string {
  const match = window.location.pathname.match(/^\/isolate\/(.+?)\/?$/);
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

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {/* Demos are authored in Japanese; force ja so component chrome (search/clear/empty
            placeholders via t()) matches the demo copy instead of the AppProvider vi default. */}
        <AppProvider defaultLocale="ja" persist={false}>
          <StoryErrorBoundary storyId={story.id}>
            <Render />
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
    <IsolateApp />
  </React.StrictMode>,
);
