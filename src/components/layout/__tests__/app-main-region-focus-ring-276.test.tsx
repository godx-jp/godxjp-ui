import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Keyboard-scroll regions now ship a visible inset mark (#1375), with an opt-out token. */

const css = () => readFileSync(join(__dirname, "../../../styles/shell-layout.css"), "utf8");
const tokens = () => readFileSync(join(__dirname, "../../../tokens/foundation.css"), "utf8");

describe("AppShell region focus ring (gh#276)", () => {
  it("gates the .app-main ring on --region-focus-ring-width (not the control ring width)", () => {
    // Since 33.28.0 (gh#1527): `:focus-visible` drops the outline for any arrival, and the ring is
    // painted by its own rule for a keyboard arrival only (not after a click on empty content).
    expect(css().match(/\.app-main:focus-visible \{[^}]+\}/)?.[0] ?? "").toContain("outline: none");
    const block =
      css().match(
        /\.app-main:focus-visible:not\(\[data-focus-origin="pointer"\]\) \{[^}]+\}/,
      )?.[0] ?? "";
    expect(block).toContain("var(--region-focus-ring-width)");
    // Colour falls back to the live focus-ring hue at the call site.
    expect(block).toContain(
      "var(--region-focus-ring-color, hsl(var(--focus-ring-color, var(--ring))))",
    );
  });

  it("defaults the region ring ON and keeps the colour token call-site-resolved", () => {
    expect(tokens()).toMatch(/--region-focus-ring-width: var\(--focus-ring-weight\);/);
    // `initial` — a :root var() binding would freeze against scoped theme overrides.
    expect(tokens()).toMatch(/--region-focus-ring-color: initial;/);
  });
});
