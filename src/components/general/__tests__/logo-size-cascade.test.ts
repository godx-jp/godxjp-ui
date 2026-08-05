import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * REGRESSION GUARD — `size` must not become a silent no-op on `<Logo mark="godx" />` again.
 *
 * THE BUG. `.ui-logo[data-mark="godx"]` set width/height from `--logo-godx-size` at the SAME
 * specificity as `.ui-logo[data-size="lg"]` (both 0,2,0) and sat LATER in the file, so source
 * order decided it and the identity mark rendered 32×32px at every tier — measured in headless
 * Chromium: xs/sm/md/lg all 32.00×32.00. A public prop that changes nothing is a defect, and the
 * godx LOCKUP already scaled its wordmark per tier (12.47px → 17.65px from xs to lg), so the
 * mark↔wordmark proportion visibly broke at `size="lg"`.
 *
 * WHY THIS TEST AND NOT `toContain`. The defect was a CASCADE fact, not a missing string — the
 * per-tier rules existed and were simply out-ranked. Asserting that some rule mentions the token
 * would have passed while the bug shipped. So this resolves the real cascade (specificity, then
 * source order) over the shipped stylesheet and asserts the WINNING `width`/`height` per tier.
 * jsdom cannot do this for us: it applies no author cascade to `getComputedStyle`.
 */

const layout = readFileSync(resolve(process.cwd(), "src/styles/logo-layout.css"), "utf8");
const tokens = readFileSync(resolve(process.cwd(), "src/tokens/components/logo.css"), "utf8");

type Rule = { selector: string; body: string; order: number };

/** Flat `selector { decls }` rules from the stylesheet (the `@layer` wrapper has no other nesting). */
function parseRules(css: string): Rule[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: Rule[] = [];
  let order = 0;
  for (const m of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    if (!selector || selector.startsWith("@")) continue;
    rules.push({ selector, body: m[2], order: order++ });
  }
  return rules;
}

/** Specificity of a compound selector built from classes + attribute selectors (no ids/elements). */
function specificity(selector: string): number {
  return (selector.match(/\.[a-z0-9-]+|\[[^\]]+\]/gi) ?? []).length;
}

/** Does a compound selector match this element's class + data-attributes? */
function matches(selector: string, el: { className: string; attrs: Record<string, string> }) {
  if (/[\s>+~,]/.test(selector.trim())) return false; // descendant/list selectors are not our target
  for (const token of selector.trim().match(/\.[a-z0-9-]+|\[[^\]]+\]/gi) ?? []) {
    if (token.startsWith(".")) {
      if (el.className !== token.slice(1)) return false;
    } else {
      const [, name, value] = token.match(/\[([a-z-]+)="([^"]*)"\]/i) ?? [];
      if (!name || el.attrs[name] !== value) return false;
    }
  }
  return true;
}

/** The declaration that actually WINS for `property`: highest specificity, then latest in source. */
function winner(property: string, el: { className: string; attrs: Record<string, string> }) {
  let best: { value: string; spec: number; order: number } | undefined;
  for (const rule of parseRules(layout)) {
    if (!matches(rule.selector, el)) continue;
    const decl = rule.body.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`));
    if (!decl) continue;
    const spec = specificity(rule.selector);
    if (!best || spec > best.spec || (spec === best.spec && rule.order > best.order)) {
      best = { value: decl[1].trim(), spec, order: rule.order };
    }
  }
  return best?.value;
}

const SIZES = ["xs", "sm", "md", "lg"] as const;

const godx = (size: string) => ({
  className: "ui-logo",
  attrs: { "data-mark": "godx", "data-size": size, "data-tone": "primary" },
});

describe("Logo size cascade — `size` drives the godx identity mark (regression)", () => {
  it('resolves a DISTINCT box per tier for mark="godx" — not one frozen value', () => {
    const widths = SIZES.map((s) => winner("width", godx(s)));
    const heights = SIZES.map((s) => winner("height", godx(s)));

    for (const [i, size] of SIZES.entries()) {
      expect(widths[i], `no width wins for size="${size}"`).toBeDefined();
      expect(widths[i]).toBe(heights[i]); // the mark box stays square
      expect(widths[i]).toContain(`--logo-godx-size-${size}`);
      // The PIN must still be reachable — a theme setting --logo-godx-size freezes every tier.
      expect(widths[i]).toContain("var(--logo-godx-size,");
    }

    // THE ACTUAL DEFECT: four tiers that all resolved to the same declaration.
    expect(new Set(widths).size).toBe(SIZES.length);
  });

  it("beats the generic [data-size] rules on specificity, so source order cannot re-break it", () => {
    for (const size of SIZES.filter((s) => s !== "md")) {
      const generic = `.ui-logo[data-size="${size}"]`;
      const identity = `.ui-logo[data-mark="godx"][data-size="${size}"]`;
      expect(layout).toContain(identity);
      expect(specificity(identity)).toBeGreaterThan(specificity(generic));
      expect(specificity(identity)).toBeGreaterThan(specificity('.ui-logo[data-mark="godx"]'));
    }
  });

  it("keeps the boxed glyph on its own --logo-size-* ramp, unchanged", () => {
    for (const size of SIZES) {
      const el = {
        className: "ui-logo",
        attrs: { "data-mark": "glyph", "data-size": size, "data-tone": "primary" },
      };
      expect(winner("width", el)).toBe(`var(--logo-size-${size})`);
    }
  });

  it("scales mark and wordmark together on the lockup — no half-applied size prop", () => {
    // The lockup's wordmark ramp is what made a fixed mark visibly wrong at lg; both must move.
    for (const size of SIZES.filter((s) => s !== "md")) {
      expect(layout).toContain(`.ui-logo-lockup[data-size="${size}"] .ui-logo-wordmark`);
    }
    expect(tokens).toContain("--logo-godx-size-lg");
    expect(tokens).toContain("--logo-wordmark-font-size-lg");
  });

  it("does not regress the --brand colour contract while resizing the mark", () => {
    // Resizing must not touch the identity fill: the mark still reads --brand at the call site.
    expect(winner("color", godx("lg"))).toBe("hsl(var(--logo-godx-color, var(--brand)))");
    expect(winner("color", godx("xs"))).toBe("hsl(var(--logo-godx-color, var(--brand)))");
    expect(winner("background", godx("lg"))).toBe("transparent");
    expect(layout).not.toMatch(/var\(--success\b/);
    expect(tokens).toContain("--logo-godx-color: initial;");
  });
});
