import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Segmented } from "../../ui/segmented";

/**
 * `Segmented` gains the 24px step (gh#719) — the fourth rung Toggle/ToggleGroup took in gh#716.
 *
 * The ladder was `sm | md | lg` = 28 / 32 / 36px, so a 24px-dense row (an audit-log toolbar, a
 * table header strip) could carry an `xs` Button and an `xs` ToggleGroup but not a Segmented, and
 * the only way to fill it was a hand-rolled row of Buttons — which loses the radiogroup semantics,
 * the arrow keys and the "1 of 3, selected" announcement. `xs` is the fourth step of the SAME
 * `--control-height` tier; no new constant enters the system.
 *
 * MEASURED in Chromium (dev preview, /isolate/data-entry-segmented) at 1440 AND 1024,
 * `getBoundingClientRect()` — every number identical at both widths:
 *
 *   step   track   item    font        item padding-inline   Button of the same step
 *   xs     24.00   20.00   12.4699px   7px                   24.00 (size="xs")
 *   sm     28.00   24.00   14px        11px                  28.00
 *   md     32.00   28.00   14px        11px                  32.00
 *   lg     36.00   32.00   14px        11px                  36.00
 *
 *   · The dense row: Segmented xs 24.00, an `xs` ToggleGroup 24.00 and a `<Button size="xs">`
 *     24.00 — top 1149.26 and bottom 1173.26 on all three, so zero overflow and no step in the row.
 *   · The selected chip still INVERTS at the new step: clicking 「月」 moved `data-state="checked"`
 *     and the slab with it — rgb(253,253,252) + `0 1px 2px rgba(0,0,0,.05)` and ink rgb(36,35,30)
 *     on the rgb(244,243,240) track, against rgb(104,102,94) on transparent for its neighbours.
 *   · Existing steps byte-identical: sm 28.00 / md 32.00 / lg 36.00, 14px, 11px, before and after.
 *   · The SEGMENT is 20.00 tall at xs, because the track spends its 2px inset on both edges at
 *     every step (sm 24, md 28, lg 32 the same way). At 26.47×20 for a one-glyph label it clears
 *     WCAG 2.2 SC 2.5.8 through the Spacing exception, not the 24px minimum: the 24px circles on
 *     two adjacent segments are 26.47px apart and do not intersect. A label narrower than 10px
 *     would close that gap, so xs is the DENSE step, not the default.
 *
 * jsdom does no layout, so what is pinned here is the attribute contract and the CSS the browser
 * resolved those numbers from.
 */
const controlCss = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8")
  .replace(/\s+/g, " ")
  .trim();
const segmentedTokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/segmented.css"),
  "utf8",
);
const controlTokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/control.css"),
  "utf8",
);

const RANGE = [
  { value: "day", label: "日" },
  { value: "week", label: "週" },
  { value: "month", label: "月" },
];

describe("Segmented xs (gh#719) — the attribute contract", () => {
  it('size="xs" reaches the track; the md default stays inert', () => {
    const { container: xs } = render(
      <Segmented aria-label="期間" size="xs" defaultValue="week" options={RANGE} />,
    );
    expect(xs.querySelector('[data-slot="segmented"]')).toHaveAttribute("data-size", "xs");

    const { container: md } = render(
      <Segmented aria-label="期間" defaultValue="week" options={RANGE} />,
    );
    // The default emits NO attribute at all, so every Segmented written before this keeps its DOM.
    expect(md.querySelector('[data-slot="segmented"]')).not.toHaveAttribute("data-size");
  });

  it("keeps the radiogroup semantics and the selected member at the new step", () => {
    const { getByRole } = render(
      <Segmented aria-label="期間" size="xs" defaultValue="week" options={RANGE} />,
    );
    const group = getByRole("radiogroup", { name: "期間" });
    expect(group).toHaveAttribute("data-size", "xs");
    expect(getByRole("radio", { name: "週" })).toBeChecked();
    expect(getByRole("radio", { name: "日" })).not.toBeChecked();
  });

  it("still paints the selected slab off data-state, at xs as at every other step", () => {
    const { container } = render(
      <Segmented aria-label="期間" size="xs" defaultValue="week" options={RANGE} />,
    );
    const items = [...container.querySelectorAll('[data-slot="segmented-item"]')];
    expect(items.map((item) => item.getAttribute("data-state"))).toEqual([
      "unchecked",
      "checked",
      "unchecked",
    ]);
  });
});

describe("Segmented xs (gh#719) — the box comes from the tier, not a literal", () => {
  it("reads --control-height-xs, exactly as Button xs does", () => {
    const rule = controlCss.match(/\.ui-segmented\[data-size="xs"\] \{([^}]*)\}/)?.[1];
    expect(rule, 'no .ui-segmented[data-size="xs"] rule').toBeDefined();
    expect(rule).toContain("--control-height: var(--control-height-xs);");
    expect(rule).toContain("font-size: var(--segmented-xs-font-size);");
    expect(rule).toContain(
      "--segmented-item-padding-inline: var(--segmented-xs-item-padding-inline);",
    );
    // No px anywhere in the step — the whole point of putting it on the tier.
    expect(rule).not.toMatch(/\d(?:px|rem)/);
  });

  it("declares both stepped lengths as its own knobs (rule #45)", () => {
    expect(segmentedTokens).toContain(
      "--segmented-xs-font-size: var(--font-size-xs, calc(var(--font-size-base) / var(--font-size-ratio)));",
    );
    expect(segmentedTokens).toContain(
      "--segmented-xs-item-padding-inline: calc(var(--control-padding-x-compact) - 1px);",
    );
  });

  it("takes the type step Button xs already reads — one step, not a new constant", () => {
    expect(controlTokens).toContain(
      "--button-xs-font-size: var(--font-size-xs, calc(var(--font-size-base) / var(--font-size-ratio)));",
    );
    expect(controlTokens).toContain(
      "--toggle-xs-font-size: var(--font-size-xs, calc(var(--font-size-base) / var(--font-size-ratio)));",
    );
  });

  it("the other three steps are unchanged", () => {
    expect(controlCss).toContain(
      '.ui-segmented[data-size="sm"] { --control-height: var(--control-height-sm); }',
    );
    expect(controlCss).toContain(
      '.ui-segmented[data-size="lg"] { --control-height: var(--control-height-lg); }',
    );
    // The md step has no rule of its own — the track composes off the ambient `--control-height`.
    expect(controlCss).not.toContain('.ui-segmented[data-size="md"]');
  });
});
