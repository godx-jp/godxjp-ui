import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A sidebar nav row is a control, so it owes a visible keyboard indicator (WCAG 2.4.7) — and it
 * has to be the design system's ring, not the user agent's.
 *
 * Measured in Chromium before this rule: the first Tab into the shell landed on a rail item
 * drawing Chrome's own `outline: rgb(0, 95, 204) auto 1px` — a blue belonging to no theme —
 * while every Button beside it drew the token ring (`outline-style: none` + box-shadow). On a
 * Slack-style shell that mismatch is the first thing a keyboard user sees.
 *
 * Asserted against the stylesheet because jsdom does no layout and computes no UA focus ring,
 * so nothing in the rendering tests next door can fail when this regresses.
 */

const shell = readFileSync(join(process.cwd(), "src/styles/shell-layout.css"), "utf8");

function ruleBody(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = shell.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  expect(match, `shell-layout.css must keep a ${selector} rule`).not.toBeNull();
  return match![1].replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("sidebar nav rows draw the design system's focus ring", () => {
  const body = () => ruleBody(".sb-nav-item:focus-visible");

  it("suppresses the user-agent outline", () => {
    expect(body()).toMatch(/outline:\s*none/);
  });

  it("draws the ring from the global focus tokens", () => {
    // Not a new component token: the tier guard wants --{component}-{part}-{property}, and the
    // shell already reads the global pair for its region ring.
    const b = body();
    expect(b).toMatch(/box-shadow:[^;]*var\(--focus-ring-width\)/);
    expect(b).toMatch(/--focus-ring-color/);
    expect(b).toMatch(/var\(--ring\)/);
  });

  it("uses box-shadow so the ring follows the row's radius", () => {
    // `outline` would draw a rectangle around a rounded row.
    expect(body()).toMatch(/box-shadow/);
    expect(body()).not.toMatch(/outline:\s*\d/);
  });

  it("is on by default, unlike the opt-in region ring", () => {
    // `.app-main` defaults to width 0 on purpose — a frame around the whole content area reads
    // as a glitch. A 2px ring hugging one 32px row is the affordance, so it must not be gated.
    expect(body()).not.toMatch(/--region-focus-ring-width/);
    expect(ruleBody(".app-main:focus-visible")).toMatch(/--region-focus-ring-width/);
  });
});
