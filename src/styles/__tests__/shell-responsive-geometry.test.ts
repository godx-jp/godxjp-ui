import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const shellStyles = readFileSync(
  resolve(process.cwd(), "src/styles/shell-layout.css"),
  "utf8",
);
const shellTokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/shell.css"),
  "utf8",
);

describe("responsive shell geometry", () => {
  it("keeps the app grid and sidebar scroll regions inside the viewport", () => {
    expect(shellStyles).toMatch(
      /\.app-root\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100vw;[^}]*min-width:\s*0;/s,
    );
    expect(shellStyles).toMatch(
      /\.app-sidebar\s*\{[^}]*height:\s*100%;[^}]*min-width:\s*0;[^}]*min-height:\s*0;/s,
    );
    expect(shellStyles).toMatch(
      /\.sb-nav-scroll\s*\{[^}]*flex:\s*1;[^}]*min-height:\s*0;[^}]*overflow-y:\s*auto;/s,
    );
  });

  it("keeps every sidebar row and icon on one tokenized flex line", () => {
    for (const token of [
      "--sidebar-nav-icon-size",
      "--sidebar-nav-item-gap",
      "--sidebar-nav-item-padding-x",
      "--sidebar-nav-gap",
      "--sidebar-nav-scroll-padding",
      "--sidebar-section-gap",
      "--sidebar-section-label-padding-x",
      "--sidebar-section-label-padding-bottom",
    ]) {
      expect(shellTokens).toContain(`${token}:`);
    }

    expect(shellStyles).toMatch(
      /\.sb-nav-item\s*\{[^}]*display:\s*flex;[^}]*height:\s*var\(--sidebar-nav-item-height\);[^}]*flex:\s*0 0 auto;[^}]*align-items:\s*center;/s,
    );
    expect(shellStyles).toMatch(
      /\.sb-icon\s*\{[^}]*width:\s*var\(--sidebar-nav-icon-size\);[^}]*height:\s*var\(--sidebar-nav-icon-size\);[^}]*line-height:\s*0;/s,
    );
  });

  it("allows Topbar and its center slot to shrink without document overflow", () => {
    expect(shellStyles).toMatch(
      /\.ui-topbar\s*\{[^}]*width:\s*auto;[^}]*min-width:\s*0;[^}]*flex:\s*1 1 0%;[^}]*overflow:\s*hidden;/s,
    );
    expect(shellStyles).toMatch(
      /\.ui-topbar-center\s*\{[^}]*flex:\s*1 1 0%;[^}]*overflow:\s*hidden;/s,
    );
  });

  it("owns canonical mobile drawer width, backdrop, safe areas and reduced motion", () => {
    expect(shellTokens).toContain("--app-shell-mobile-nav-width: 22.5rem;");
    expect(shellTokens).toContain("--app-shell-mobile-nav-background: rgb(0 0 0 / 0.2);");
    expect(shellStyles).toMatch(
      /\.app-mobile-nav-overlay\s*\{[^}]*background-color:\s*var\(--app-shell-mobile-nav-background\);/s,
    );
    expect(shellStyles).toMatch(
      /\.app-mobile-nav-drawer\s*\{[^}]*safe-area-inset-top[^}]*safe-area-inset-bottom[^}]*safe-area-inset-left[^}]*safe-area-inset-right[^}]*overscroll-behavior:\s*contain;/s,
    );
    expect(shellStyles).toMatch(
      /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.app-mobile-nav-overlay,[^}]*\.app-mobile-nav-drawer\s*\{[^}]*animation:\s*none;[^}]*transition:\s*none;/s,
    );
  });
});
