import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * gh#276 — the keyboard-scroll focus ring on `.app-main` is token-gated and
 * DEFAULT OFF (`--region-focus-ring-width: 0`, a deliberate product tradeoff
 * against WCAG 2.4.7): a control-strength brand frame around the whole content
 * region reads as a glitch to mouse-first users. Services opt in via the token.
 */

const css = () => readFileSync(join(__dirname, "../../../styles/shell-layout.css"), "utf8");
const tokens = () => readFileSync(join(__dirname, "../../../tokens/foundation.css"), "utf8");

describe("AppShell region focus ring (gh#276)", () => {
  it("gates the .app-main ring on --region-focus-ring-width (not the control ring width)", () => {
    const block = css().match(/\.app-main:focus-visible \{[^}]+\}/)?.[0] ?? "";
    expect(block).toContain("var(--region-focus-ring-width)");
    expect(block).toContain("outline: none");
    // Colour falls back to the live focus-ring hue at the call site.
    expect(block).toContain(
      "var(--region-focus-ring-color, hsl(var(--focus-ring-color, var(--ring))))",
    );
  });

  it("defaults the region ring OFF and keeps the colour token call-site-resolved", () => {
    expect(tokens()).toMatch(/--region-focus-ring-width: 0;/);
    // `initial` — a :root var() binding would freeze against scoped theme overrides.
    expect(tokens()).toMatch(/--region-focus-ring-color: initial;/);
  });
});
