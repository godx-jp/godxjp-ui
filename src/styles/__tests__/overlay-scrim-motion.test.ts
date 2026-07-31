import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

const dialogStyles = read("src/styles/dialog-layout.css");
const shellStyles = read("src/styles/shell-layout.css");
const feedbackTokens = read("src/tokens/components/feedback.css");
const shellTokens = read("src/tokens/components/shell.css");
const semanticLayout = read("src/tokens/semantic/layout.css");

/** The declarations of the LAST rule whose selector list contains `selector` exactly. */
function declarationsFor(css: string, selector: string): string {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: string[] = [];
  const rule = /([^{}]*)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(stripped)) !== null) {
    const selectors = match[1].split(",").map((part) => part.trim());
    if (selectors.includes(selector)) blocks.push(match[2]);
  }
  return blocks.join("\n");
}

/**
 * gh#215 — `--overlay-background` was documented as "the single backdrop colour shared by EVERY
 * overlay" but NOTHING consumed it: Dialog, Sheet and the AppShell mobile drawer each carried a
 * private literal, so a service that set the shared token got no effect at all. These tests pin the
 * wiring so it cannot rot back.
 */
describe("shared overlay scrim (gh#215)", () => {
  it("still declares ONE shared scrim in the semantic tier", () => {
    expect(semanticLayout).toContain("--overlay-background: rgb(0 0 0 / 0.5);");
  });

  it("declares every per-overlay scrim knob `initial`, never a private literal", () => {
    // Role-mirror rule (docs/TOKENS.md): a `:root` binding to the shared token would FREEZE at the
    // :root value, so a scoped `[data-tenant] { --overlay-background: … }` / `.dark` override could
    // never reach the portaled overlay. `initial` + a call-site fallback re-resolves live.
    expect(feedbackTokens).toContain("--dialog-overlay-background: initial;");
    expect(feedbackTokens).toContain("--sheet-overlay-background: initial;");
    expect(shellTokens).toContain("--app-shell-mobile-nav-background: initial;");
    expect(feedbackTokens).not.toMatch(/--(?:dialog|sheet)-overlay-background:\s*rgb/);
    expect(shellTokens).not.toMatch(/--app-shell-mobile-nav-background:\s*rgb/);
  });

  it("routes all three scrims through --overlay-background at the call site", () => {
    // Each surface takes a documented SHARE of the one scrim, so the calibrated per-surface depth
    // (a slide-in drawer washes more lightly than a modal) survives while a single
    // `--overlay-background` override retints every backdrop in the system.
    const cases: [string, string, string][] = [
      [
        declarationsFor(dialogStyles, ".ui-dialog-overlay"),
        "--dialog-overlay-background",
        "--dialog-overlay-alpha",
      ],
      [
        declarationsFor(dialogStyles, '[data-slot="sheet-overlay"]'),
        "--sheet-overlay-background",
        "--sheet-overlay-alpha",
      ],
      [
        declarationsFor(shellStyles, '[data-slot="sheet-overlay"].app-mobile-nav-overlay'),
        "--app-shell-mobile-nav-background",
        "--app-shell-mobile-nav-alpha",
      ],
    ];

    for (const [declarations, knob, alpha] of cases) {
      const flat = declarations.replace(/\s+/g, " ");
      expect(flat).toContain(
        `background-color: var( ${knob}, color-mix(in srgb, var(--overlay-background) var(${alpha}), transparent) );`,
      );
    }
  });

  it("keeps every scrim default byte-identical to the pre-wiring literals", () => {
    // 0.5 × 60% = 0.3 (dialog, was `rgb(0 0 0 / 0.3)`); 0.5 × 40% = 0.2 (sheet + drawer, was
    // `rgb(0 0 0 / 0.2)`). Wiring the shared token must not darken any existing surface.
    expect(feedbackTokens).toContain("--dialog-overlay-alpha: 60%;");
    expect(feedbackTokens).toContain("--sheet-overlay-alpha: 40%;");
    expect(shellTokens).toContain("--app-shell-mobile-nav-alpha: 40%;");
  });

  it("leaves no overlay opted out of the shared scrim with a hard-coded backdrop", () => {
    // The TwoFactorSetup dialog used to re-state `rgb(0 0 0 / 0.3)` at a higher specificity, which
    // silently excluded that one dialog from --overlay-background theming.
    expect(
      declarationsFor(dialogStyles, '[data-slot="dialog-overlay"].ui-two-factor-setup-overlay'),
    ).toBe("");
    for (const sheet of [dialogStyles, shellStyles]) {
      const stripped = sheet.replace(/\/\*[\s\S]*?\*\//g, "");
      expect(stripped).not.toMatch(/background-color:\s*rgb\(0 0 0/);
    }
  });
});

/**
 * gh#215 / WCAG 2.3.3 (Animation from Interactions) + 2.2.2 — Dialog, AlertDialog, CommandPalette,
 * Sheet and Popover all animate on open/close via Tailwind `data-[state]:animate-*` utilities and
 * were NOT gated on reduced motion. Only the motion is removed; the overlay still appears and
 * disappears instantly, so the open/closed state stays unambiguous.
 */
describe("overlay reduced-motion gating (gh#215)", () => {
  /** The body of the reduced-motion block, plus whether it sits inside `@layer components`. */
  function reducedMotionBlock(css: string) {
    const index = css.indexOf("@media (prefers-reduced-motion: reduce)");
    expect(index).toBeGreaterThan(-1);
    const open = css.indexOf("{", index);
    let depth = 1;
    let cursor = open + 1;
    while (cursor < css.length && depth > 0) {
      if (css[cursor] === "{") depth += 1;
      else if (css[cursor] === "}") depth -= 1;
      cursor += 1;
    }
    // Layered? Count the unbalanced `{` before the block — an unlayered block sits at depth 0.
    const before = css.slice(0, index).replace(/\/\*[\s\S]*?\*\//g, "");
    const nesting = (before.match(/\{/g) ?? []).length - (before.match(/\}/g) ?? []).length;
    return { body: css.slice(open + 1, cursor - 1), nesting };
  }

  it("gates dialog, sheet, popover and command-palette animations", () => {
    const { body } = reducedMotionBlock(dialogStyles);
    for (const selector of [
      '[data-slot="dialog-overlay"]',
      '[data-slot="dialog-content"]',
      '[data-slot="sheet-overlay"]',
      '[data-slot="sheet-content"]',
      '[data-slot="popover-content"]',
      ".ui-dialog-overlay",
      ".ui-command-palette",
    ]) {
      expect(body).toContain(selector);
    }
    expect(body).toMatch(/animation:\s*none;/);
    expect(body).toMatch(/transition:\s*none;/);
  });

  it("declares the gate OUTSIDE @layer components so it can actually win", () => {
    // Tailwind v4 emits `animate-in` / `slide-in-from-*` into `@layer utilities`, which beats ANY
    // rule inside `@layer components` regardless of specificity. A gate written in the components
    // layer is dead code; an UNLAYERED author rule beats every layered one.
    expect(reducedMotionBlock(dialogStyles).nesting).toBe(0);
    expect(reducedMotionBlock(shellStyles).nesting).toBe(0);
  });

  it("keeps the AppShell mobile drawer gated too", () => {
    const { body } = reducedMotionBlock(shellStyles);
    expect(body).toContain(".app-mobile-nav-overlay");
    expect(body).toContain(".app-mobile-nav-drawer");
    expect(body).toMatch(/animation:\s*none;/);
    expect(body).toMatch(/transition:\s*none;/);
  });
});
