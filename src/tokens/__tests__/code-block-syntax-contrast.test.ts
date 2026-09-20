import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { anchorIndex } from "../../test/css-selector";
import { contrast, hsl, hslToRgb } from "./wcag-contrast";

/**
 * SYNTAX COLOUR IS TEXT, SO IT OWES WCAG 1.4.3 (gh#784).
 *
 * The first cut of these defaults mapped the syntax tokens onto the FILL roles — `--success` for
 * a string, `--destructive` for a deleted line — because those are the names that read correctly
 * in prose. Measured against the block's own `--muted` ground they are unreadable:
 *
 *   string    → --success      2.01:1  light    ← string literals, the most common token in a file
 *   inserted  → --success      2.01:1  light
 *   constant  → --attention    3.05:1  light
 *   deleted   → --destructive  2.41:1  dark
 *   function  → --info         3.94:1  dark
 *
 * A fill role is meant to sit UNDER `*-foreground`, not to be ink. The `--text-*` tier exists for
 * ink, and on it all twelve clear AA in both themes. This file is the measurement, kept so the
 * mapping cannot drift back to the names that merely sound right.
 */
const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const layout = readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");

/** Code is body text at `--code-block-font-size` (sm), so the bar is the small-text one. */
const AA_TEXT = 4.5;

const themes = [
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark, :root[data-theme="dark"] {' },
] as const;

/** The twelve, and the role each one's CALL SITE falls back to. Read out of the CSS, not retyped. */
function fallbackRole(token: string): string {
  const at = anchorIndex(layout, `var(--code-block-token-${token}-color,`);
  expect(at, `${token} must have a call-site fallback`).toBeGreaterThan(-1);
  const tail = layout.slice(at, at + 200);
  const role = tail.match(/hsl\(\s*var\(\s*(--[a-z-]+)/)?.[1];
  expect(role, `${token}'s fallback must resolve a role`).toBeDefined();
  return role!.slice(2);
}

const TOKENS = [
  "comment",
  "keyword",
  "string",
  "string-expression",
  "function",
  "constant",
  "parameter",
  "punctuation",
  "link",
  "inserted",
  "deleted",
] as const;

describe.each(themes)("CodeBlock syntax colours ($theme)", ({ selector }) => {
  const start = anchorIndex(foundation, selector);
  const open = foundation.indexOf("{", start);
  const body = foundation.slice(open + 1, foundation.indexOf("\n}", open));
  const rgb = (name: string) => hslToRgb(hsl(body, name));

  it.each(TOKENS)("%s is readable on the block's own ground", (token) => {
    // The surface is `hsl(var(--muted))` — see `:is(.ui-code-block, .ui-prose pre)`.
    const ratio = contrast(rgb(fallbackRole(token)), rgb("muted"));
    expect(
      ratio,
      `${token} → --${fallbackRole(token)} is ${ratio.toFixed(2)}:1 on --muted, under ${AA_TEXT}`,
    ).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("tells `link` from `keyword` without relying on colour", () => {
    // Measured: in dark `--text-link` and `--primary` are the SAME colour (dE 0.0 — both are
    // hue-snapped to the identity violet), so the tint alone cannot separate a link from a
    // keyword, and a keyword is the most frequent token there is. The underline is what carries
    // it. WCAG 1.4.1: never colour-only.
    const at = anchorIndex(layout, '[data-code-token="link"]');
    const rule = layout.slice(at, layout.indexOf("}", at));
    expect(rule, "the link token needs a non-colour mark").toMatch(
      /text-decoration-line:\s*underline/,
    );
    // And it must be the HOUSE underline: a bare one clips descenders on a mono face, which is
    // where an underline usually goes wrong — and this one is load-bearing, not decorative.
    expect(rule, "use --text-link-underline-offset, not a bare underline").toContain(
      "text-underline-offset: var(--text-link-underline-offset)",
    );
    expect(rule).toMatch(/text-decoration-skip-ink:\s*auto/);
  });

  it("no token falls back to a FILL role, whatever its ratio happens to be today", () => {
    // The ratios above would catch a bad fill role only while the palette stays as it is. This
    // catches the CATEGORY error directly: fills are for backgrounds, `--text-*` is for ink.
    const fills = ["success", "destructive", "info", "warning", "attention", "primary-foreground"];
    for (const token of TOKENS) {
      const role = fallbackRole(token);
      expect(
        fills,
        `${token} falls back to the FILL role --${role}; use the --text-* tier`,
      ).not.toContain(role);
    }
  });
});
