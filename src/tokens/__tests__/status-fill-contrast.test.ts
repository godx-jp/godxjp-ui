import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb } from "./wcag-contrast";

/**
 * A SOLID STATUS CHIP KEEPS ITS LABEL READABLE.
 *
 * `--success` / `--warning` / `--info` / `--attention` are FILLS: a Badge, an Alert, a status
 * capsule, an email urgency band. Text sits on them, so WCAG 2.2 SC 1.4.3 applies at 4.5:1 —
 * the fill against its own `--*-foreground`, never against the page, because on a filled chip the
 * page is nowhere near the label.
 *
 * Nothing measured that pair before. `primary-text-contrast` and `interactive-fill-contrast`
 * cover the two INTERACTIVE fills, `tone-mark-contrast` covers the thin `--mark-*` rails at the
 * non-text 3:1, and the status fills sat between the two files untested. What was shipping in the
 * light theme (gh#643, caught by `check:frame-axe` on /isolate/foundation-colors, 2 nodes at each
 * of 320 / 375 / 1440):
 *
 *   --success-foreground   on --success     2.19:1
 *   --attention-foreground on --attention   3.32:1
 *
 * Both were a near-white ink on a pale fill, while the sibling `--warning` had always used the
 * near-black one and the DARK theme already flipped all three. Paper maths is admissible here for
 * the same reason `tone-mark-contrast` records: a chip paints `hsl(var(--role))` flat with its
 * label directly on top, with no compositing in between — and Chromium agreed to two decimals
 * (2.19 predicted, axe reported 2.18 at the rendered 12.47px).
 */

const AA_TEXT = 4.5;

const CSS = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function block(selector: string): string {
  const start = CSS.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = CSS.indexOf("{", start);
  return CSS.slice(open + 1, CSS.indexOf("\n}", open));
}

const THEMES = [
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
] as const;

const FILLS = ["success", "warning", "info", "attention"] as const;

describe.each(THEMES)("status fills keep their label at AA ($theme)", ({ selector }) => {
  const body = block(selector);

  it.each(FILLS)("--%s", (role) => {
    const fill = hslToRgb(hsl(body, role));
    const ink = hslToRgb(hsl(body, `${role}-foreground`));

    expect(contrast(fill, ink)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});
