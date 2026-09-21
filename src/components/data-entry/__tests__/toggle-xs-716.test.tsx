import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Toggle } from "../../ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";

/**
 * `Toggle` / `ToggleGroup` gain the 24px step (gh#716).
 *
 * The ladder was `sm | md | lg` = 28 / 32 / 36px, so a 24px-dense row had no segmented control and
 * the next person to need one would have hand-rolled it out of Buttons. `xs` is the fourth step of
 * the SAME `--control-height` tier — no new constant enters the system.
 *
 * MEASURED in Chromium (dev preview, /isolate/data-entry-toggle and -toggle-group) at 1440 AND
 * 1024, `getBoundingClientRect()`:
 *
 *   step   Toggle height   ToggleGroupItem height   Button of the same step
 *   xs     24.00           24.00                    24.00 (size="xs")
 *   sm     28.00           28.00                    28.00
 *   md     32.00           32.00                    32.00
 *   lg     36.00           36.00                    36.00
 *
 *   · An xs chip in a 24px row: row 24.00, chip 24.00 → 0.00 overflow, and it sits level with the
 *     `<Button size="xs">` beside it (same top, same bottom, both 24.00).
 *   · Label type 12.47px (`--font-size-xs`, Button xs's own step), contrast 14.25:1 unpressed and
 *     5.04:1 pressed — the pair `tokens/components/toggle.css` documents, unchanged by the step.
 *   · Defaults unchanged: an unsized Toggle and an unsized ToggleGroup still measured 32.00.
 *
 * jsdom does no layout, so what is pinned here is the class contract and the CSS the browser
 * resolved those numbers from.
 */
const controlCss = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8")
  .replace(/\s+/g, " ")
  .trim();
const controlTokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/control.css"),
  "utf8",
);

describe("Toggle xs (gh#716) — the class contract", () => {
  it('size="xs" selects the xs box; the md default is untouched', () => {
    const { container: xs } = render(<Toggle size="xs">未読</Toggle>);
    expect(xs.querySelector('[data-slot="toggle"]')).toHaveClass("ui-toggle-xs");

    const { container: md } = render(<Toggle>未読</Toggle>);
    const fallback = md.querySelector('[data-slot="toggle"]')!;
    expect(fallback).toHaveClass("ui-toggle-default-size");
    expect(fallback).not.toHaveClass("ui-toggle-xs");
  });

  it('ToggleGroup size="xs" reaches every item through context', () => {
    const { container } = render(
      <ToggleGroup type="single" size="xs" defaultValue="day" aria-label="期間">
        <ToggleGroupItem value="day">日次</ToggleGroupItem>
        <ToggleGroupItem value="month">月次</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(container.querySelector('[data-slot="toggle-group"]')).toHaveAttribute(
      "data-size",
      "xs",
    );
    const items = [...container.querySelectorAll('[data-slot="toggle-group-item"]')];
    expect(items).toHaveLength(2);
    for (const item of items) {
      expect(item).toHaveAttribute("data-size", "xs");
      expect(item).toHaveClass("ui-toggle-xs");
    }
  });

  it("an explicit item size still wins over the group's", () => {
    const { container } = render(
      <ToggleGroup type="single" size="xs" defaultValue="day" aria-label="期間">
        <ToggleGroupItem value="day">日次</ToggleGroupItem>
        <ToggleGroupItem value="month" size="lg">
          月次
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const items = [...container.querySelectorAll('[data-slot="toggle-group-item"]')];
    expect(items[0]).toHaveClass("ui-toggle-xs");
    expect(items[1]).toHaveClass("ui-toggle-lg");
  });

  it("keeps the pressed state and the accessible name at the new step", () => {
    const { getByRole } = render(
      <Toggle size="xs" defaultPressed aria-label="未読のみ" count={12} countLabel="件" />,
    );
    const chip = getByRole("button", { name: "未読のみ, 12 件" });
    expect(chip).toHaveAttribute("data-state", "on");
    expect(chip).toHaveClass("ui-toggle-xs");
  });
});

describe("Toggle xs (gh#716) — the box comes from the tier, not a literal", () => {
  it("reads --control-height-xs, exactly as Button xs does", () => {
    const rule = controlCss.match(/\.ui-toggle-xs \{([^}]*)\}/)?.[1];
    expect(rule, "no .ui-toggle-xs rule").toBeDefined();
    expect(rule).toContain("min-height: var(--control-height-xs);");
    expect(rule).toContain("font-size: var(--toggle-xs-font-size);");
    // No px anywhere in the step — the whole point of putting it on the tier.
    expect(rule).not.toMatch(/\d(?:px|rem)/);
  });

  it("the type step is Button xs's step, declared as its own knob (rule #45)", () => {
    expect(controlTokens).toContain(
      "--toggle-xs-font-size: var(--font-size-xs, calc(var(--font-size-base) / var(--font-size-ratio)));",
    );
    expect(controlTokens).toContain(
      "--button-xs-font-size: var(--font-size-xs, calc(var(--font-size-base) / var(--font-size-ratio)));",
    );
  });

  it("the other three steps are unchanged", () => {
    expect(controlCss).toMatch(/\.ui-toggle-sm \{[^}]*min-height: var\(\s*--control-height-sm\);/);
    expect(controlCss).toMatch(
      /\.ui-toggle-default-size \{[^}]*min-height: var\(\s*--control-height\);/,
    );
    expect(controlCss).toMatch(/\.ui-toggle-lg \{[^}]*min-height: var\(\s*--control-height-lg\);/);
  });
});
