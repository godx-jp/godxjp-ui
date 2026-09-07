import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { globSync } from "node:fs";

import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

/**
 * A MODIFIER ON THE POPOVER SURFACE MUST GO THROUGH A KNOB, NOT THROUGH THE RAW PROPERTY.
 *
 * `PopoverContent` always paints `.ui-popover-content`, and a caller adds its own class beside it
 * to retune the box — `.ui-time-picker-popover`, `.ui-control-panel-flush`. Both live in
 * control.css; the base rule lives in dialog-layout.css; the two selectors have IDENTICAL
 * specificity (one class each) and sit in the same `@layer components`. Cascade order therefore
 * decides, and styles/index.css imports control.css BEFORE dialog-layout.css — so the modifier
 * always loses, silently.
 *
 * It was not theoretical. Measured in Chromium at 1440×1000 before the fix: the TimePicker panel
 * rendered 144px wide inside a 288px popover with 16px of popover padding it had asked to drop —
 * 111px of empty box to the right of the columns, which is what the report showed. The DatePicker
 * calendar carried the same unwanted 16px inset. A/B with an identical-specificity rule appended
 * last took the popover to 146px / 0px, which is what proves the cause is ORDER and not weight.
 *
 * The fix routes `width` through a `--popover-surface-inline-size` knob, joining the three colour
 * knobs the same rule already had. Padding needed nothing new: it already read
 * `--popover-space-inset`, which is the token `PopoverContent flush` overrides inline (gh#354), so
 * a modifier can set that same token. A custom property set on the element has no ordering
 * problem: the base rule is the only reader, the modifier the only writer.
 *
 * This test guards the RULE, not those two instances. Any class handed to `PopoverContent` is
 * discovered from the source, and any surface property it declares raw is a failure — because that
 * declaration is one import-order change away from doing nothing at all.
 */

const dialogStyles = read("src/styles/dialog-layout.css");
const controlStyles = read("src/styles/control.css");
const feedbackTokens = read("src/tokens/components/feedback.css");
const indexStyles = read("src/styles/index.css");

const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Declarations of every rule whose selector list contains `selector` exactly. */
function declarationsFor(css: string, selector: string): string {
  const blocks: string[] = [];
  const rule = /([^{}]*)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(strip(css))) !== null) {
    if (match[1].split(",").some((part) => part.trim() === selector)) blocks.push(match[2]);
  }
  return blocks.join("\n");
}

/** Every `ui-*` class this repo hands to `<PopoverContent className=…>`. */
function popoverModifierClasses(): string[] {
  const files = globSync("src/components/**/*.tsx");
  const found = new Set<string>();
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const tag = /<PopoverContent\b[\s\S]*?>/g;
    let match: RegExpExecArray | null;
    while ((match = tag.exec(source)) !== null) {
      for (const cls of match[0].matchAll(/["'`]([^"'`]*\bui-[a-z0-9-]+[^"'`]*)["'`]/g)) {
        for (const token of cls[1].split(/\s+/)) {
          if (token.startsWith("ui-") && token !== "ui-popover-content") found.add(token);
        }
      }
    }
  }
  return [...found].sort();
}

/**
 * Properties of the surface a modifier plausibly wants to retune. Each must be readable through a
 * knob on the base rule, because a modifier can only reach it that way.
 */
const SURFACE_PROPERTIES = [
  { property: "width", knob: "--popover-surface-inline-size", declaredInitial: true, also: ["inline-size"] },
  { property: "padding", knob: "--popover-space-inset", declaredInitial: false, also: ["padding-inline", "padding-block"] },
];

describe("popover surface knobs beat cascade order", () => {
  const base = declarationsFor(dialogStyles, ".ui-popover-content");

  it("still has the ordering hazard this test exists for", () => {
    // If control.css ever moves after dialog-layout.css the raw-property route would start
    // working by accident, and a future reader would rightly wonder why the knobs exist.
    const control = indexStyles.indexOf('@import "./control.css"');
    const dialog = indexStyles.indexOf('@import "./dialog-layout.css"');
    expect(control).toBeGreaterThan(-1);
    expect(dialog).toBeGreaterThan(-1);
    expect(control).toBeLessThan(dialog);
  });

  it.each(SURFACE_PROPERTIES)("reads $property through $knob", ({ property, knob, declaredInitial }) => {
    // A role-mirror knob is declared `initial` so the call-site fallback resolves (docs/TOKENS.md);
    // `--popover-space-inset` is a real token with a real value, so it is declared differently.
    expect(feedbackTokens).toContain(declaredInitial ? `${knob}: initial;` : `${knob}: `);
    expect(base).toMatch(new RegExp(`\\b${property}:\\s*var\\(${knob}[,)]`));
  });

  const modifiers = popoverModifierClasses();

  it("finds the modifier classes to check", () => {
    // A silent empty list would make every assertion below vacuous.
    expect(modifiers.length).toBeGreaterThan(0);
  });

  it.each(modifiers)("%s retunes the surface through knobs only", (modifier) => {
    const declarations = declarationsFor(controlStyles, `.${modifier}`);
    for (const { property, knob, also } of SURFACE_PROPERTIES) {
      for (const raw of [property, ...also]) {
        expect(
          declarations,
          `.${modifier} declares \`${raw}\` directly. It shares specificity with ` +
            `.ui-popover-content and is imported before it, so that declaration never wins — ` +
            `set ${knob} instead.`,
        ).not.toMatch(new RegExp(`(^|[;{\\s])${raw}\\s*:`));
      }
    }
  });
});
