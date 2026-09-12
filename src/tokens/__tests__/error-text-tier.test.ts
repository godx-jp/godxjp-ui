import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb } from "./wcag-contrast";

/**
 * ERROR PROSE READS THE TEXT TIER, NEVER THE FILL TIER (gh#610).
 *
 * This system paints a tone three ways and each tier has its own contract (docs/TOKENS.md):
 * `--destructive` is the FILL (a solid Button/Badge, judged against the label ON it),
 * `--text-error` is the TEXT tier (small coloured type, 4.5:1 against the surface BEHIND it), and
 * `--mark-destructive` is the thin meaningful shape. The fill tier is TUNED for a white label on
 * top of it, so on the dark spine it sits deliberately light — and read as ink it fails. Measured
 * in Chromium on `/isolate/layout-auth-recovery-examples-mfa-challenge`:
 *
 *   dark  --destructive #be373e on --card #21201c → 2.95:1   (the shipped value)
 *   dark  --text-error  #eb7076 on --card #21201c → 5.52:1
 *   light --text-error  #aa181f on the light card → 7.21:1
 *
 * That 2.95:1 line was `<FormField error>` — the ONE sentence that says why a field was rejected,
 * and on a sign-in form the only thing a locked-out user has to read. `Alert`/`Text`/`Heading`
 * already resolved their destructive ink through `--text-error`; the `role="alert"` prose the
 * data-entry primitives render was still on `text-destructive`, so the same tone was readable in
 * an Alert and near-invisible one line below it, in the field that caused it.
 *
 * TWO CONTRACTS, because either one alone can hold while the bug is live:
 *   1. the TOKEN clears AA on every surface error prose sits on, in BOTH themes;
 *   2. no component paints prose with the FILL-tier utility at all.
 *
 * `check:contrast` is the browser counterpart and now carries the two auth-shell routes this
 * defect lived on; this file is the deterministic half, so a palette edit cannot spend the
 * headroom back without a browser in the loop.
 */

const ROOT = process.cwd();
const foundation = readFileSync(join(ROOT, "src/tokens/foundation.css"), "utf8");

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function block(selector: string): string {
  const start = foundation.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = foundation.indexOf("{", start);
  return foundation.slice(open + 1, foundation.indexOf("\n}", open));
}

const THEMES = {
  light: block(":root {"),
  dark: block('.dark,\n:root[data-theme="dark"] {'),
} as const;

/**
 * The grounds error prose is painted on. `--muted` is the one gh#610 was reported against: it is
 * the `.ui-auth-shell` page ground, so a sign-in form's error line sits on it directly whenever
 * the field is not inside a Card.
 */
const GROUNDS = ["background", "card", "muted"] as const;

const AA = 4.5;

describe("error prose reads the AA text tier (gh#610)", () => {
  for (const [theme, body] of Object.entries(THEMES)) {
    const ink = hslToRgb(hsl(body, "text-error"));
    for (const ground of GROUNDS) {
      it(`${theme}: --text-error on --${ground} meets AA (>= ${AA}:1)`, () => {
        expect(contrast(ink, hslToRgb(hsl(body, ground)))).toBeGreaterThanOrEqual(AA);
      });
    }
  }
});

/** Every `.tsx`/`.ts` under `dir`, minus `__tests__`. */
function sourceFiles(dir: string, match: RegExp): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(ROOT, dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(ROOT, rel)).isDirectory()) {
      if (entry === "__tests__") continue;
      out.push(...sourceFiles(rel, match));
    } else if (match.test(entry)) {
      out.push(rel);
    }
  }
  return out;
}

describe("no component paints prose with the destructive FILL tier (gh#610)", () => {
  /**
   * `text-destructive` is the fill-tier utility; `text-destructive-foreground` is the label ON a
   * destructive fill and is correct, so the lookahead is load-bearing.
   */
  const FILL_UTILITY = /\btext-destructive\b(?!-)/;

  /**
   * A SOURCE SCAN, not a render assertion on one component: the defect was a CLASS of ten sites
   * across three files (`form-field`, `branch-scope-picker`, `upload`), and a per-component test
   * on the reported one would have passed on the other nine.
   */
  it("no `text-destructive` utility in src/components or src/lib", () => {
    const offenders = [
      ...sourceFiles("src/components", /\.tsx?$/),
      ...sourceFiles("src/lib", /\.ts$/),
    ].filter((file) => FILL_UTILITY.test(readFileSync(join(ROOT, file), "utf8")));
    expect(offenders).toEqual([]);
  });

  /**
   * The CSS half, and it now sweeps EVERY stylesheet instead of the one rule gh#610 reported.
   *
   * The earlier version of this test checked `.ui-dialog-step-up-error` alone, and said in its own
   * comment that it deliberately did not sweep every `color: hsl(var(--destructive))` because
   * "tone ICONS and rails legitimately keep the brighter role colour (1.4.11's 3:1 floor)". Half
   * of that was right and half of it hid gh#612: there were 19 more such rules, seven of them
   * prose, and the icons were not clearing 3:1 either — `--warning` as ink is **1.74:1** on
   * `--background` in the light theme and `--success` is 2.19:1, both under the non-text floor as
   * well. A narrow assertion written in the shape of the reported bug is how the class survived.
   *
   * So the rule is now inverted: reading a FILL token as `color` is an ERROR unless the selector
   * is listed in EXEMPT with a reason. That way forgetting is loud, and a deliberate exception is
   * a line of code someone had to write.
   */
  const FILL_AS_INK = /^\s*color:\s*hsl\(var\(--(destructive|warning|success|info)\)\)/;

  /**
   * Selectors allowed to read the FILL tier as `color`, each with the reason recorded next to the
   * rule itself in the stylesheet. Rating stars are shape-distinguished glyphs, not prose; see the
   * comment above `.ui-rating-star-filled` in `control.css`.
   */
  const EXEMPT = new Set([".ui-rating-star-filled", ".ui-rating-star-half-filled"]);

  it("no stylesheet paints `color` from a FILL token outside the exemption list (gh#612)", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles("src/styles", /\.css$/)) {
      const lines = readFileSync(join(ROOT, file), "utf8").split("\n");
      let selector = "";
      lines.forEach((line, index) => {
        if (line.trimEnd().endsWith("{")) selector = line.trim().replace(/\s*\{$/, "");
        if (!FILL_AS_INK.test(line)) return;
        if ([...EXEMPT].some((allowed) => selector.includes(allowed))) return;
        offenders.push(`${file}:${index + 1}  ${selector}`);
      });
    }
    expect(offenders, "move these to the --text-* tier, or add the selector to EXEMPT with a reason in the CSS").toEqual([]);
  });
});
