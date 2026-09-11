import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * THE RING RULE CAN BE PERFECT AND STILL PAINT NOTHING.
 *
 * focus-ring.css lives in `@layer components`. A Tailwind `outline-*` utility lives in
 * `@layer utilities`, and a later layer beats every specificity — so a component that carries
 * `outline-none` on the SAME element that the ring rule names silently wins, and the mark this
 * package draws never reaches a pixel.
 *
 * MEASURED, not reasoned. Chromium, `/isolate/data-entry-input`, `<html data-focus-outline="on">`
 * with `--focus-ring-weight: 2px`, a real `Tab` press (`document.activeElement` read back to prove
 * the key landed):
 *
 *   Button  `outline: 2px solid rgb(0,113,189)`   ← the reference control, no utility
 *   Input   `outline-style: none`                 ← same page, same switch, same weight
 *
 * The same defeat was on Checkbox, Radio, Switch, the Tabs panel and both overlay close buttons
 * (those two via `focus:outline-hidden`, which paints a TRANSPARENT 2px outline — worse, because
 * `outline-width` then reads `2px` and a measurement that only samples the width reports a ring
 * that nobody can see).
 *
 * WHY THE UTILITY IS NOT NEEDED AT ALL. It was there to suppress Chrome's default ring.
 * focus-ring.css declares `outline` on every one of these elements unconditionally, and with the
 * switch off that declaration resolves to `0px` — so the browser default is already replaced in
 * both switch positions and nothing has to suppress it a second time.
 *
 * The behavioural half of this gate is scripts/check-focus-ring-paint.mjs, which presses Tab in a
 * real browser. This half is the cheap one that runs on every `pnpm test`.
 */

const STYLES_DIR = join(__dirname, "..");
const FOCUS_RING_CSS = readFileSync(join(STYLES_DIR, "focus-ring.css"), "utf8");

/** Every class the focus mark rule names, read OUT of the shipped CSS rather than retyped. */
function ringClasses(): string[] {
  const start = FOCUS_RING_CSS.indexOf(":is(\n    .ui-focus-ring,");
  expect(start, "the mark rule must exist").toBeGreaterThan(-1);
  const markRule = FOCUS_RING_CSS.slice(start, FOCUS_RING_CSS.indexOf("{", start));
  const names = new Set<string>();
  for (const m of markRule.matchAll(/\.((?:ui|sb|tb)-[a-z0-9-]+)/g)) names.add(m[1]);
  expect(names.size, "the mark rule must name controls").toBeGreaterThan(10);
  return [...names];
}

/**
 * Tailwind utilities that turn an outline off, in every variant spelling
 * (`outline-none`, `focus:outline-hidden`, `md:focus-visible:outline-none`…).
 */
const SUPPRESSORS = /(?:^|[\s"'`])(?:[a-z0-9:[\]&_-]+:)?outline-(?:none|hidden)(?=$|[\s"'`])/;

function sourceFiles(): string[] {
  return globSync("src/**/*.{ts,tsx}", { cwd: process.cwd() }).filter(
    (f) => !f.includes("__tests__") && !f.endsWith(".d.ts"),
  );
}

describe("focus ring — no utility defeats the components layer", () => {
  it("no ring-list class ships an outline-suppressing Tailwind utility on the same element", () => {
    const classes = ringClasses();
    const offenders: string[] = [];

    for (const file of sourceFiles()) {
      const text = readFileSync(join(process.cwd(), file), "utf8");
      // Class lists are string literals. Read each literal on its own: a suppressor three lines
      // away in a different string is a different element and not a finding.
      for (const literal of text.matchAll(/"([^"\n]*)"|'([^'\n]*)'|`([^`\n]*)`/g)) {
        const body = literal[1] ?? literal[2] ?? literal[3] ?? "";
        if (!SUPPRESSORS.test(body)) continue;
        const hit = classes.find((c) => new RegExp(`(?:^|\\s)${c}(?=$|\\s)`).test(body));
        if (hit) offenders.push(`${file}: .${hit} + outline suppressor — ${body.slice(0, 90)}`);
      }
    }

    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  // The rule above only holds while the ring is drawn as an `outline`. If the mark ever moves back
  // to the box-shadow form, `outline-none` stops being a defeat and this gate has to be rewritten
  // rather than deleted — so pin the form the gate assumes.
  it("the mark is painted as an outline, which is what makes a suppressor a defeat", () => {
    expect(FOCUS_RING_CSS).toMatch(/outline:\s*var\(--focus-ring-width\)\s*solid/);
  });
});
