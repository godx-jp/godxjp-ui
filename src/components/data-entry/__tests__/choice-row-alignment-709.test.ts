import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * gh#709 — THE BOX AND ITS INLINE LABEL SHARE ONE LINE, AND A FIELD WITH NO LABEL KEEPS THE
 * CONTROL COLUMN.
 *
 * Measured in Chromium at 1280px on `/isolate/data-entry-form-root` (dev preview), LTR and RTL:
 *
 *   box/label vertical-centre delta   -2.5px → 0.0px   (16px box, 21px label line)
 *   label start                       box inline-end + 8px (= --choice-gap), both directions
 *   boolean field height              63.8px (label row + box row) → 32px (one row)
 *   horizontal layout, no label       control column left 185px — identical to a labelled sibling
 *
 * jsdom has no layout engine, so the measurement above is the evidence and this file pins the
 * declarations that produce it — including the five repeated horizontal blocks, where a missed
 * breakpoint is the realistic regression.
 */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const CONTROL_CSS = stripComments(
  readFileSync(join(__dirname, "../../../styles/control.css"), "utf8"),
);
const FORM_CSS = stripComments(
  readFileSync(join(__dirname, "../../../styles/form-layout.css"), "utf8"),
);

const COLLAPSE_KEYS = ["false", "sm", "md", "lg", "xl"] as const;

function ruleFor(css: string, selector: RegExp): string | undefined {
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    if (selector.test(m[1]!.replace(/\s+/g, " ").trim())) return m[2]!;
  }
  return undefined;
}

describe("choice row alignment (gh#709)", () => {
  it("centres the control on the label's first line", () => {
    const rule = ruleFor(CONTROL_CSS, /^\.ui-choice-field > \.ui-choice-control$/);
    expect(rule, "no .ui-choice-field > .ui-choice-control rule").toBeDefined();
    expect(rule).toMatch(/align-items:\s*center;/);
    // One line box of the LABEL's own type — never a literal height.
    expect(rule).toMatch(/line-height:\s*var\(--control-label-line-height\);/);
    expect(rule).toMatch(/min-block-size:\s*1lh;/);
    expect(rule).not.toMatch(/\d+px/);
  });

  it("keeps the box → label gap on the shared choice token", () => {
    const rule = ruleFor(CONTROL_CSS, /^\.ui-choice-field$/);
    expect(rule).toMatch(/gap:\s*var\(--choice-gap\);/);
  });

  it.each(COLLAPSE_KEYS)(
    "collapseBelow=%s: a label-less horizontal field keeps the control column",
    (key) => {
      const rule = ruleFor(
        FORM_CSS,
        new RegExp(
          `^\\.ui-form-field\\[data-collapse-below="${key}"\\]\\[data-layout="horizontal"\\] > \\.ui-form-field-control:first-child$`,
        ),
      );
      expect(rule, `no label-less control rule for collapseBelow=${key}`).toBeDefined();
      expect(rule).toMatch(/grid-column-start:\s*2;/);
    },
  );
});
