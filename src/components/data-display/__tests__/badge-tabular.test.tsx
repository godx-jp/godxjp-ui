import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Badge } from "../badge";

/**
 * `tabular` — lining, fixed-width figures for a chip whose content is a COUNT.
 *
 * The axis already existed on `Text`, on `TableCell` and on `StatCard`; the chip that a count most
 * often lands IN did not have it, which is an asymmetry rather than a decision. With proportional
 * figures a `1` is narrower than a `0`, so a column of count chips jitters and the digits do not
 * line up.
 *
 * MEASURED HONESTLY: with the font stack this library ships, `tabular-nums` moves NO pixels.
 * `"1111"` and `"0000"` both advance 31.094px at the chip's 12.47px, with and without it, because
 * the resolved face already gives its figures one advance. The prop is the DECLARATION, and it is
 * what survives a service retuning `--font-family-sans` to a face whose figures are proportional —
 * the same reason `Text` and `TableCell` carry the axis. It is deliberately NOT the fix for chips
 * of different WIDTHS down a column: `11` and `100` are two and three figures.
 *
 * A LEGAL MOVE DID EXIST, and it is the reason this is one prop rather than a component:
 * `<Badge><Text size="xs" tabular>11</Text></Badge>` measures 12.4699px against the chip's own
 * 12.4699px label and lines the digits up correctly (measured in Chromium). It just asks the call
 * site to know that a Badge's type step is `xs` — the chip's own `--badge-font-size` token — so a
 * theme that retunes that token silently desyncs every such call site.
 */
describe("Badge tabular", () => {
  it("is off by default — a chip carrying words does not pay for wider figures", () => {
    const { container } = render(<Badge tone="info">審査中</Badge>);
    expect(container.querySelector('[data-slot="badge"]')).not.toHaveAttribute("data-tabular");
  });

  it("marks the chip when asked", () => {
    const { container } = render(
      <Badge tone="info" tabular>
        11
      </Badge>,
    );
    expect(container.querySelector('[data-slot="badge"]')).toHaveAttribute("data-tabular", "");
  });

  /**
   * jsdom applies no stylesheet, so the declaration is asserted where it is written — and on the
   * CHIP rather than on the label span, so that a number the caller wraps in something of its own
   * still inherits it.
   */
  it("declares tabular figures on the chip, so a wrapped number inherits them", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/badge-layout.css"), "utf8");
    const selector = '[data-slot="badge"][data-tabular] {';
    const start = css.indexOf(selector);
    expect(start, "no rule for [data-tabular]").toBeGreaterThan(-1);
    const rule = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
    expect(rule).toContain("font-variant-numeric: tabular-nums");
  });

  /** It is an independent axis: a tone, an icon and a status still resolve exactly as before. */
  it("does not disturb tone, icon or status resolution", () => {
    const { container } = render(<Badge status="pending" tabular />);
    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge).toHaveAttribute("data-tone", "warning");
    expect(badge).toHaveAttribute("data-tabular", "");
    expect(container.querySelector('[data-slot="badge-icon"]')).not.toBeNull();
  });
});
