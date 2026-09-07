import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrast, hsl, hslToRgb } from "./wcag-contrast";

/**
 * A FILLED BUTTON KEEPS ITS LABEL LEGIBLE IN EVERY STATE IT CAN BE IN.
 *
 * `primary-text-contrast.test.ts` already holds the RESTING fill against its own label. It stops
 * there, and that gap is where a real defect lived: a consuming app's axe sweep caught the primary
 * submit button mid-hover at 4.2:1, because antd steps an interactive fill one ramp position
 * LIGHTER on hover in the light theme — straight towards the near-white label sitting on it — and
 * one position DARKER on press in the dark theme, straight towards the near-black label there.
 * antd is content with that (its own stock primary button measures 3.1:1 on white); this library is
 * not, because docs/DESIGN-AUTHORITY.md hands anything the user READS to the Japanese standard and
 * JIS X 8341-3 tracks WCAG AA.
 *
 * The fix lives in scripts/gen-antd-tokens.mjs — it reflects the ramp rather than picking a colour
 * — so this file is the floor that fix is held to, not a restatement of it. It reads the GENERATED
 * stylesheet on purpose: a reflection quietly dropped from the generator lands here as a failure.
 *
 * A state is only worth asserting on if a label actually rides on it, hence `--*-foreground` as the
 * measured pair rather than the page background: on a hovered primary button the page is nowhere
 * near the label.
 */

const AA_TEXT = 4.5;

const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const generated = readFileSync(join(process.cwd(), "src/tokens/antd.generated.css"), "utf8");

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("\n}", open));
}

const THEMES = [
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
] as const;

const FILLS = [
  { role: "primary", label: "primary-foreground" },
  { role: "destructive", label: "destructive-foreground" },
] as const;

describe.each(THEMES)("interactive fills keep their label at AA ($theme)", ({ selector }) => {
  const committed = block(foundation, selector);
  const derived = block(generated, selector);

  describe.each(FILLS)("$role", ({ role, label }) => {
    const foreground = hslToRgb(hsl(committed, label));

    it.each([
      { state: "rest", body: committed, token: role },
      { state: "hover", body: derived, token: `${role}-hover` },
      { state: "active", body: derived, token: `${role}-active` },
    ])("$state", ({ body, token }) => {
      expect(contrast(hslToRgb(hsl(body, token)), foreground)).toBeGreaterThanOrEqual(AA_TEXT);
    });
  });
});
