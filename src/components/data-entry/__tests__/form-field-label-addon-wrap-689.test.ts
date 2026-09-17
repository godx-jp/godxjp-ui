import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * gh#689 — A TEXT `labelAddon` IN A HORIZONTAL/INLINE FIELD WRAPS UNDER THE LABEL, INSIDE THE
 * LABEL COLUMN, INSTEAD OF SPILLING INTO THE CONTROL COLUMN.
 *
 * The label row is a flex row inside a fixed `--form-label-width` grid track. With no wrap, a text
 * addon (`<Button size="xs" variant="link">Assign to myself</Button>`) squeezed the label and ran
 * past the column edge. Measured in Chromium against built `dist/styles/index.css`, label column
 * 128px, before this fix:
 *
 *   labelAlign="start"  row scrollWidth 179 / clientWidth 128, addon right edge 51px past the column
 *   labelAlign="end"    the row overflowed the other way: label start edge 51px before the column
 *
 * After: scrollWidth 128 / 128, the addon sits on its own line under the label, 0px past either
 * edge. Vertical layout is untouched — its computed styles and rects are identical before/after.
 *
 * jsdom has no layout, so the measurement is the evidence and this file pins the declarations that
 * produce it: every place the stylesheet switches a field to horizontal/inline (the unconditional
 * `collapseBelow=false` rule and each `collapseBelow` breakpoint) must also let the label row wrap
 * and cap its items to the column. A breakpoint that is missed is the realistic regression — the
 * block is repeated five times.
 */
const FORM_CSS = readFileSync(join(__dirname, "../../../styles/form-layout.css"), "utf8");

const COLLAPSE_KEYS = ["false", "sm", "md", "lg", "xl"] as const;

function rulesFor(selectorTail: RegExp): string[] {
  const out: string[] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(FORM_CSS))) {
    if (selectorTail.test(m[1]!.replace(/\s+/g, " "))) out.push(`${m[1]!.trim()} {${m[2]}}`);
  }
  return out;
}

describe("FormField labelAddon — horizontal/inline label row wraps (gh#689)", () => {
  it.each(COLLAPSE_KEYS)("collapseBelow=%s: the label row wraps", (key) => {
    const rows = rulesFor(
      new RegExp(
        `\\[data-collapse-below="${key}"\\]:is\\(\\[data-layout="horizontal"\\], \\[data-layout="inline"\\]\\) > \\.ui-form-field-label\\s*$`,
      ),
    );
    expect(rows, `no horizontal label-row rule for collapseBelow=${key}`).not.toHaveLength(0);
    expect(rows.some((r) => /flex-wrap:\s*wrap;/.test(r))).toBe(true);
  });

  it.each(COLLAPSE_KEYS)("collapseBelow=%s: label-row items are capped to the column", (key) => {
    const items = rulesFor(
      new RegExp(
        `\\[data-collapse-below="${key}"\\]:is\\(\\[data-layout="horizontal"\\], \\[data-layout="inline"\\]\\) > \\.ui-form-field-label > \\*\\s*$`,
      ),
    );
    expect(items, `no label-row item rule for collapseBelow=${key}`).not.toHaveLength(0);
    expect(items.some((r) => /max-inline-size:\s*100%;/.test(r))).toBe(true);
  });

  it("leaves the vertical (base) label row alone", () => {
    const base = FORM_CSS.match(/\n\s*\.ui-form-field-label\s*\{([^}]*)\}/);
    expect(base, ".ui-form-field-label base rule not found").not.toBeNull();
    expect(base![1]).not.toMatch(/flex-wrap|max-inline-size/);
    expect(FORM_CSS).not.toMatch(/\n\s*\.ui-form-field-label\s*>\s*\*\s*\{/);
  });
});
