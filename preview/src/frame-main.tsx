import "./preload-recovery";
import "./preview-tailwind.css";
import "./frame.css";

import * as React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { AppProvider } from "../../src/app/app-provider";
import {
  StoryDemoBlock,
  type DevicePresetId,
  type DemoBlockInitialView,
  DEVICE_PRESETS,
} from "./demo-block";
import { getStorySource, STORY_MAP } from "./preview-catalog";
import { queryClient, StoryErrorBoundary, useLazyStory } from "./preview-runtime";

function parseStoryId(): string {
  const match = window.location.pathname.match(/\/frame\/(.+?)\/?$/);
  if (!match?.[1]) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

type FrameChrome = {
  dir: "ltr" | "rtl";
  density: "compact" | "default" | "comfortable";
  theme: "light" | "dark";
  locale: string;
};

/**
 * Infra-level frame modes (issue #163) driven purely by query params so any /frame/**
 * route can be exercised RTL / at a density / dark without editing per-component
 * example content:  /frame/<id>?dir=rtl&density=compact&theme=dark&locale=ja
 */
function parseFrameChrome(): FrameChrome {
  const sp = new URLSearchParams(window.location.search);
  const dir = sp.get("dir") === "rtl" ? "rtl" : "ltr";
  const densityRaw = sp.get("density");
  const density = densityRaw === "compact" || densityRaw === "comfortable" ? densityRaw : "default";
  const theme = sp.get("theme") === "dark" ? "dark" : "light";
  const locale = sp.get("locale") || "ja";
  return { dir, density, theme, locale };
}

/**
 * The frame root needs exactly ONE top-level `<main>` landmark — but whether that main
 * belongs to US (a bare component/fragment demo, e.g. a Card showcase with no page shell)
 * or to the STORY ITSELF (a full-screen recipe that renders `AppShell`/`AuthShell`, which
 * already emit their own `<main>`) is a runtime fact, not something knowable from story
 * metadata (every catalog entry defaults to `layout: "fullscreen"` regardless of content).
 * Detect it after mount: if the rendered subtree already contains a `<main>`/`role="main"`,
 * render a plain `<div>` (avoids `landmark-no-duplicate-main` / `landmark-main-is-top-level`);
 * otherwise render the REAL `<main>` element ourselves (avoids `landmark-one-main`).
 *
 * This renders the actual `<main>` TAG, not a `role="main"` div: several axe landmark
 * checks (e.g. `landmark-banner-is-top-level`'s body-context match for the toolbar
 * `<header>`) walk ancestors by native tag name (`article, aside, main, nav, section`),
 * not computed role — a `<div role="main">` would NOT be recognized as sectioning
 * content by that walk, so the `<header>` inside it would wrongly start resolving to a
 * top-level `banner` landmark.
 */
function FrameLandmark({ dir, children }: { dir: "ltr" | "rtl"; children: React.ReactNode }) {
  const ref = React.useRef<HTMLElement>(null);
  // Optimistic default: an own `<main>` (the common case — most demos are bare
  // component/fragment showcases with no page shell of their own).
  const [asMain, setAsMain] = React.useState(true);

  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const hasOwnMain = node.querySelector('main, [role="main"]') != null;
    setAsMain(!hasOwnMain);
  });

  const Tag = asMain ? "main" : "div";
  return (
    <Tag ref={ref} className="preview-frame" dir={dir}>
      {children}
    </Tag>
  );
}

function parseInitialView(): DemoBlockInitialView | undefined {
  const sp = new URLSearchParams(window.location.search);
  const preset = sp.get("preset");
  const zoomRaw = sp.get("zoom");
  const w = Number(sp.get("w"));
  const h = Number(sp.get("h"));

  const presetId =
    preset && DEVICE_PRESETS.some((p) => p.id === preset) ? (preset as DevicePresetId) : undefined;
  const zoom =
    zoomRaw === "fit"
      ? ("fit" as const)
      : zoomRaw != null && Number.isFinite(Number(zoomRaw))
        ? Number(zoomRaw)
        : undefined;

  if (!presetId && zoom == null && !Number.isFinite(w) && !Number.isFinite(h)) return undefined;

  return {
    presetId,
    zoom,
    width: Number.isFinite(w) ? w : undefined,
    height: Number.isFinite(h) ? h : undefined,
  };
}

function FrameApp() {
  const storyId = parseStoryId();
  const story = STORY_MAP.get(storyId);
  const initialView = React.useMemo(() => parseInitialView(), []);
  const chrome = React.useMemo(() => parseFrameChrome(), []);
  const { Render, loading, error, sourceVersion } = useLazyStory(story);
  const source = React.useMemo(() => (story ? getStorySource(story) : ""), [story, sourceVersion]);

  if (!storyId || !story) {
    return (
      <div className="preview-runtime-error">
        <strong>Preview not found</strong>
        <p>Unknown id: {storyId || "(empty)"}</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {/* Demos are authored in Japanese; force ja so component chrome (search/clear/empty
            placeholders via t()) matches the demo copy instead of the AppProvider vi default. */}
        <AppProvider
          defaultLocale={chrome.locale}
          theme={chrome.theme}
          density={chrome.density}
          persist={false}
        >
          {/* `dir` on the frame root flips logical CSS (ms/me/ps/pe, start/end) for the
              whole subtree — a global RTL frame mode (#163) independent of demo locale. */}
          <FrameLandmark dir={chrome.dir}>
            <StoryDemoBlock
              storyId={story.id}
              source={source}
              layout={story.layout}
              viewportWidth={story.viewportWidth}
              viewportHeight={story.viewportHeight}
              initialView={initialView}
              showFooter={false}
              loading={loading}
              error={error}
            >
              {Render ? (
                <StoryErrorBoundary storyId={story.id}>
                  <Render />
                </StoryErrorBoundary>
              ) : null}
            </StoryDemoBlock>
          </FrameLandmark>
        </AppProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");

createRoot(container).render(
  <React.StrictMode>
    <FrameApp />
  </React.StrictMode>,
);
