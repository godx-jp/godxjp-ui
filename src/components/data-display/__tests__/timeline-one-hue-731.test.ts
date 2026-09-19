import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { anchorIndex } from "../../../test/css-selector";

import { contrast, hsl, hslToRgb, NON_TEXT, over } from "../../../tokens/__tests__/wcag-contrast";

/**
 * gh#731 — ONE HUE DOWN THE TIMELINE'S PROGRESS COLUMN.
 *
 * Timeline used to paint the steps behind you from `--success` (the STATUS green, 若竹) and the
 * step you are on — plus the line joining them — from `--primary` (the ACTION hue). Measured on
 * /isolate/data-display-timeline in Chromium, light theme: done #69bf8e, current #7a00ff, line
 * #7a00ff. Two unrelated roles in one rail, so re-theming `--primary` moved half the column and
 * left the other half green; the product owner reported it as a brand-identity defect.
 *
 * `Steps` — the same "progress through a sequence" idea, one group over — already answers it:
 * `.ui-steps-dot[data-status="finish"]` and `[data-status="process"]` BOTH take `hsl(var(--primary))`
 * and process is told apart by a RING (antd's contract too — only `error` leaves the primary hue).
 *
 * These guards read the committed CSS rather than restating the colours, so repointing a call site
 * back at `--success` fails here instead of shipping green. The numbers below were confirmed in
 * Chromium against the rendered page (paper maths agrees to two decimals because every one of
 * these surfaces paints a flat `hsl()` with no compositing in between, except the ring, which is
 * composited here exactly as the browser does it).
 */
const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

const layout = read("src/styles/data-display-layout.css");
const tokens = read("src/tokens/components/data-display.css");
const navigation = read("src/styles/navigation-layout.css");
const foundation = read("src/tokens/foundation.css");

/** The body of the FIRST rule whose selector list contains `selector`. */
function rule(css: string, selector: string): string {
  const at = css.indexOf(selector);
  if (at === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", at);
  return css.slice(open + 1, css.indexOf("}", open));
}

function themeBlock(selector: string): string {
  const start = anchorIndex(foundation, selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = foundation.indexOf("{", start);
  return foundation.slice(open + 1, foundation.indexOf("\n}", open));
}

const THEMES = {
  light: themeBlock(":root {"),
  dark: themeBlock('.dark, :root[data-theme="dark"] {'),
} as const;

const role = (body: string, name: string) => hslToRgb(hsl(body, name));

/** Every rail surface that says "this part of the sequence is behind you or under way". */
const PROGRESS_CALL_SITES = {
  "the dot base (the fallback for any status)": ".ui-timeline-dot {",
  "the done dot": '.ui-timeline-dot[data-status="done"]',
  "the current dot": '.ui-timeline-dot[data-status="current"]',
  "the travelled line": '.ui-timeline-line[data-completed="true"]',
} as const;

describe("Timeline paints its whole progress column from ONE role (gh#731)", () => {
  for (const [what, selector] of Object.entries(PROGRESS_CALL_SITES)) {
    it(`${what} falls back to hsl(var(--primary)), never --success`, () => {
      const body = rule(layout, selector);
      expect(body).toMatch(/background:\s*var\(--timeline-[a-z-]+, hsl\(var\(--primary\)\)\)/);
      expect(body).not.toContain("--success");
    });
  }

  it("no Timeline rule reads --success at all any more", () => {
    // Every `.ui-timeline*` rule EXCEPT the unrelated `.ui-timeline-grid` family, collected rule by
    // rule so a `--success` elsewhere in this 2500-line file (ThoughtChain, Legend, ChatBubble)
    // can neither mask a regression nor fail this guard.
    const rules = [...layout.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, selector]) =>
      /\.ui-timeline(?!-grid)/.test(selector),
    );
    expect(rules.length).toBeGreaterThan(5);
    for (const [, selector, body] of rules) {
      expect(`${selector.trim().split("\n").pop()} → ${body}`).not.toContain("--success");
    }
  });

  it("reads the SAME role Steps paints finish and process with", () => {
    const steps = rule(navigation, '.ui-steps-dot[data-status="finish"]');
    expect(steps).toContain("hsl(var(--primary))");
    expect(rule(layout, '.ui-timeline-dot[data-status="done"]')).toContain("hsl(var(--primary))");
  });
});

describe("the current item is told apart by its RING, not by a second role", () => {
  const current = rule(layout, '.ui-timeline-dot[data-status="current"]');
  const done = rule(layout, '.ui-timeline-dot[data-status="done"]');

  it("only the current dot carries a ring", () => {
    expect(current).toContain(
      "box-shadow: 0 0 0 var(--timeline-dot-current-ring-width) hsl(var(--primary) / 0.2)",
    );
    expect(done).not.toContain("box-shadow");
  });

  it("the ring is Steps' process ring, token-for-token", () => {
    const width = (css: string, name: string) =>
      css.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();
    expect(width(tokens, "--timeline-dot-current-ring-width")).toBe(
      width(read("src/tokens/components/navigation.css"), "--steps-dot-process-ring-width"),
    );
    // `[data-status="process"]` has TWO rules — the fill it shares with `finish`, then the ring —
    // so collect both and assert the ring is among them rather than pinning a source order.
    const processRules = [...navigation.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, selector]) => selector.includes('.ui-steps-dot[data-status="process"]'))
      .map(([, , body]) => body);
    expect(processRules.length).toBeGreaterThan(1);
    expect(processRules.join("")).toContain(
      "box-shadow: 0 0 0 var(--steps-dot-process-ring-width) hsl(var(--primary) / 0.2)",
    );
  });

  it("the state is also carried non-chromatically, so the ring is never the only cue", () => {
    // Timeline.tsx sets aria-current="step" and a localized sr-only prefix on the current item,
    // and picks a different glyph for it (Plane / pip vs CheckCircle2 / check) — WCAG 1.4.1.
    const source = read("src/components/data-display/timeline.tsx");
    expect(source).toContain('aria-current={isCurrent ? "step" : undefined}');
    expect(source).toContain("SR_PREFIX_KEY[status]");
    expect(source).toContain("isCurrent ? Plane : CheckCircle2");
  });
});

describe("the role-mirror knobs still override, and stay `initial` (gh#687 freeze rule)", () => {
  const KNOBS = [
    "--timeline-dot-done-background",
    "--timeline-dot-done-foreground",
    "--timeline-dot-current-background",
    "--timeline-line-completed-background",
  ];

  it.each(KNOBS)("%s is `initial` in the token tier", (knob) => {
    expect(tokens).toContain(`${knob}: initial;`);
  });

  it.each(KNOBS)("%s is read with its role default AT THE CALL SITE", (knob) => {
    expect(layout).toMatch(new RegExp(`var\\(${knob}, hsl\\(var\\(--[a-z-]+\\)\\)\\)`));
  });

  it("the token tier never binds a Timeline knob to a tenant-scoped role", () => {
    expect(tokens).not.toMatch(/--timeline-(?:dot|line)-[a-z-]+:\s*var\(--(?:primary|success)\)/);
  });

  it("documents the two-declaration line that restores the pre-gh#731 pairing", () => {
    expect(tokens).toContain("--timeline-dot-done-background: hsl(var(--success));");
    expect(tokens).toContain("--timeline-dot-done-foreground: hsl(var(--success-foreground));");
  });
});

describe("every dot state keeps its glyph legible, light and dark", () => {
  for (const [theme, body] of Object.entries(THEMES)) {
    const primary = role(body, "primary");
    const primaryInk = role(body, "primary-foreground");
    const card = role(body, "card");

    it(`${theme}: the done and current glyph clears AA on the shared fill`, () => {
      // Chromium, /isolate/data-display-timeline: 6.31:1 light, 10.72:1 dark — identical for the
      // CheckCircle2, the check and the pip, since all three ink from the same `color`.
      expect(contrast(primaryInk, primary)).toBeGreaterThanOrEqual(4.5);
    });

    it(`${theme}: the pending glyph clears AA on the surface it sits on`, () => {
      expect(
        contrast(role(body, "muted-foreground"), role(body, "background")),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it(`${theme}: the dot and the travelled line clear 1.4.11 against the card`, () => {
      // The green done dot measured 2.18:1 here before gh#731 — under the floor for a mark.
      expect(contrast(primary, card)).toBeGreaterThanOrEqual(NON_TEXT);
    });

    it(`${theme}: the ring reads as a band distinct from the dot it surrounds`, () => {
      // A 20% tint can never clear 3:1 on the card AND stay separate from the fill (at α 0.5 it is
      // 2.73:1 / 2.31:1 — a bigger dot, not a ring), so the measure that matters is ring-vs-fill:
      // 4.33:1 light, 6.11:1 dark, over a footprint that grows 24px → 32px.
      expect(contrast(over(primary, card, 0.2), primary)).toBeGreaterThanOrEqual(NON_TEXT);
    });

    it(`${theme}: the restored green pairing needs BOTH knobs to stay legible`, () => {
      const success = role(body, "success");
      expect(contrast(role(body, "success-foreground"), success)).toBeGreaterThanOrEqual(4.5);
      if (theme === "light") {
        // Why --timeline-dot-done-foreground exists: the two roles have opposite ink polarity, so
        // restoring the fill alone leaves the near-white primary ink on 若竹 at 2.18:1 (gh#643).
        expect(contrast(primaryInk, success)).toBeLessThan(NON_TEXT);
      }
    });
  }
});
