import "./preload-recovery";
import "./preview-tailwind.css";
import "./preview.css";

import * as React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { STORY_ENTRIES } from "./preview-catalog";

// Machine-readable frame manifest for the headless harness (scripts/frame-*.mjs).
// Reused as the single source of truth so the axe/geometry/coverage gates never
// re-derive story ids — they load `/`, read this global, then iterate `/frame/<id>`.
declare global {
  interface Window {
    __STORY_MANIFEST__?: Array<{
      id: string;
      kind: "doc" | "preview";
      layout: "fullscreen" | "padded";
      groupPath: string[];
      storyName: string;
      fullTitle: string;
    }>;
  }
}
window.__STORY_MANIFEST__ = STORY_ENTRIES.map((e) => ({
  id: e.id,
  kind: e.kind,
  layout: e.layout,
  groupPath: e.groupPath,
  storyName: e.storyName,
  fullTitle: e.fullTitle,
}));

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
