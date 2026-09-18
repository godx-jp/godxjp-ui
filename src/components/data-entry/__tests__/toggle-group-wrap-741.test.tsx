import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Flex } from "../../layout/flex";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";

/**
 * `ToggleGroup wrap` (gh#741).
 *
 * The defect: `.ui-toggle-group` was `inline-flex` with a gap and NO `flex-wrap`, so a chip row
 * wider than its rail could not break — and a consumer adopting 27.10.0's
 * `Toggle variant="soft" shape="pill"` hand-built a `<ul>` of individual `<Toggle>`s instead,
 * losing the group's shared `variant`/`size`/`shape` context, its single `value`/`onValueChange`
 * and its arrow-key traversal.
 *
 * MEASURED in Chromium (dev preview :6197, /isolate/data-entry-toggle-group), `getComputedStyle`
 * + `getBoundingClientRect`, the group's containing block pinned to an exact 320px rail:
 *
 *   twelve-chip soft/pill xs row   lines   box height   clientW / scrollW   col gap   row gap
 *   without wrap (27.10.0)         1       171.50px     320 / 644 (clips)   4px       —
 *   with wrap, LTR                 4       108.00px     320 / 320           4px       4px
 *   with wrap, RTL                 4       108.00px     320 / 320           4px       4px
 *   with wrap, (pointer: coarse)   4       156.00px     320 / 320           4px       4px
 *
 *   · "1 line" there means one FLEX line — the chips report five distinct `top` values only
 *     because they are squeezed to min-content and end up five different heights (44.38 · 65.56 ·
 *     86.75 · 129.13 · 171.5, each label broken over up to seven text lines). The row still
 *     overflows its rail by 324px on top of that.
 *   · UNCHANGED when it does not wrap, before and after, at the same 320px rail: the four-item
 *     segmented group is 1 line / 32.00px / 4px gap, and on a coarse pointer
 *     (`hasTouch: true, isMobile: true`, which is what flips `(pointer: coarse)`) 1 line /
 *     44.00px — the SC 2.5.8 tap floor is where it was. Per size: xs 24→36 · sm 28→40 · md 32→44
 *     · lg 36→48, identical before and after.
 *   · THE DEFAULT, measured rather than assumed: forcing `flex-wrap: wrap` on all 18 groups of
 *     the docs page changed 0 of the 17 that already fit — same line count, same height, at a
 *     320px AND a 1358px rail — including all three of `default`/`outline`/`soft` at three items.
 *     So `variant` is not the axis that decides and gets no different default; and a default of
 *     `true` could only move the rows that overflow today (171.5px → 108px), silently, on an
 *     upgrade whose call sites did not change. `Flex wrap` is `false`; one word, one default.
 *   · ARROW KEYS across the wrapped lines: 0@L1 → 1@L1 → 2@L1 → 3@L2 → 4@L2 → 5@L2 → 6@L3 →
 *     7@L3 → 8@L3 → 9@L3 → 10@L4 → 11@L4, in LTR and in RTL — DOM order, never visual line
 *     order. Space on the last one added it to the value. DevTools console: clean.
 *
 * jsdom does no layout and no cascade, so what is pinned here is the attribute/class contract,
 * the CSS those numbers were resolved from, and the behaviour that must survive wrapping.
 */
const controlCss = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");
const flat = (css: string) => css.replace(/\s+/g, " ").trim();

const TAGS = ["design", "runbook", "security", "onboarding", "incident", "contract"];

function TagRow(props: { wrap?: boolean; onValueChange?: (value: string[]) => void }) {
  return (
    <ToggleGroup
      type="multiple"
      variant="soft"
      shape="pill"
      size="xs"
      wrap={props.wrap}
      defaultValue={["design"]}
      onValueChange={props.onValueChange}
      aria-label="タグで絞り込み"
    >
      {TAGS.map((tag) => (
        <ToggleGroupItem key={tag} value={tag}>
          {tag}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

describe("ToggleGroup wrap (gh#741) — the CSS contract", () => {
  it("wraps ONLY under the opt-in attribute", () => {
    const css = flat(controlCss);
    expect(css).toContain('.ui-toggle-group[data-wrap="true"] { flex-wrap: wrap; }');
    // The base rule must stay wrap-less, or every 27.10.0 group would re-flow unasked.
    const base = css.match(/\.ui-toggle-group \{([^}]*)\}/)?.[1];
    expect(base, "no .ui-toggle-group rule").toBeDefined();
    expect(base).not.toContain("flex-wrap");
  });

  it("keeps ONE gap declaration, which is what makes the two wrapped axes equal", () => {
    const base = flat(controlCss).match(/\.ui-toggle-group \{([^}]*)\}/)?.[1] ?? "";
    expect(base).toContain("gap: var(--space-1);");
    // A row/column pair could drift apart; measured 4px × 4px on the wrapped row.
    expect(base).not.toMatch(/\brow-gap\b|\bcolumn-gap\b/);
    // No second gap anywhere in the wrap rule either.
    const wrapRule = flat(controlCss).match(
      /\.ui-toggle-group\[data-wrap="true"\] \{([^}]*)\}/,
    )?.[1];
    expect(wrapRule).toBe(" flex-wrap: wrap; ");
  });
});

describe("ToggleGroup wrap (gh#741) — the emitted attribute", () => {
  it("emits nothing at all unless asked", () => {
    const { container } = render(<TagRow />);
    expect(container.querySelector('[data-slot="toggle-group"]')).not.toHaveAttribute("data-wrap");
  });

  it('emits data-wrap="true" when asked', () => {
    const { container } = render(<TagRow wrap />);
    expect(container.querySelector('[data-slot="toggle-group"]')).toHaveAttribute(
      "data-wrap",
      "true",
    );
  });

  it("spells it exactly as Flex does — one vocabulary for 'this row does not fit'", () => {
    const { container } = render(
      <>
        <Flex wrap>
          <span>a</span>
        </Flex>
        <TagRow wrap />
      </>,
    );
    const flex = container.querySelector(".ui-flex")!;
    const group = container.querySelector('[data-slot="toggle-group"]')!;
    expect(group.getAttribute("data-wrap")).toBe(flex.getAttribute("data-wrap"));
  });

  it("does not leak `wrap` onto the DOM as an attribute of its own", () => {
    const { container } = render(<TagRow wrap />);
    const group = container.querySelector('[data-slot="toggle-group"]')!;
    expect(group.hasAttribute("wrap")).toBe(false);
  });
});

describe("ToggleGroup wrap (gh#741) — a wrapped row is still a GROUP", () => {
  it("still hands every item the row's variant / size / shape", () => {
    const { container } = render(<TagRow wrap />);
    const items = [...container.querySelectorAll('[data-slot="toggle-group-item"]')];
    expect(items).toHaveLength(TAGS.length);
    for (const item of items) {
      expect(item).toHaveClass("ui-toggle-soft", "ui-toggle-xs", "rounded-[var(--radius-pill)]");
      expect(item).toHaveAttribute("data-variant", "soft");
      expect(item).toHaveAttribute("data-shape", "pill");
    }
  });

  it("still reports the whole row through ONE value / onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TagRow wrap onValueChange={onValueChange} />);
    // The last chip is on the last wrapped line at a 320px rail — the one a hand-built <ul> of
    // standalone Toggles could not report through the row's own callback.
    await user.click(screen.getByRole("button", { name: "contract" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["design", "contract"]);
    await user.click(screen.getByRole("button", { name: "design" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["contract"]);
  });

  it("walks the arrow keys in DOM order, whatever line a chip landed on", async () => {
    const user = userEvent.setup();
    render(<TagRow wrap />);
    const items = TAGS.map((tag) => screen.getByRole("button", { name: tag }));
    items[0].focus();
    for (let i = 1; i < items.length; i++) {
      await user.keyboard("{ArrowRight}");
      expect(document.activeElement, `step ${i}`).toBe(items[i]);
    }
    // …and the item focus landed on is the item Space selects.
    await user.keyboard(" ");
    expect(items[items.length - 1]).toHaveAttribute("aria-pressed", "true");
  });
});
