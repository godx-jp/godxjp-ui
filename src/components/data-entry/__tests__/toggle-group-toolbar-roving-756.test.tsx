import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ToggleGroup, ToggleGroupItem } from "../toggle-group";

/*
 * gh#756 — a roving tab stop with no arrow keys to rove it.
 *
 * `disallowEmptySelection` earns the radio pattern (gh#744), and APG's radio group is ONE tab
 * stop on the checked item. That is correct — as long as the arrows move it.
 *
 * React Aria's `useToolbar` disables its own arrow handler whenever it finds a `role="toolbar"`
 * ancestor, on the assumption that the toolbar owns navigation:
 *
 *     onKeyDownCapture: !isInToolbar ? onKeyDown : undefined
 *
 * This library's `Toolbar` is a plain `div role="toolbar"` that handles no keys. So in that
 * nesting nobody owns the arrows, and the one tab stop becomes a trap: the reporter measured a
 * three-item scale where 週 and 月 could not be reached by ANY keyboard — 1 of 3 tab stops, arrows
 * inert, keydown reaching the group with `defaultPrevented === false`. That is WCAG 2.1.1, level A.
 *
 * So the roving stop is installed only where the arrows are live. Inside a toolbar the group falls
 * back to a tab stop per item: N stops instead of one, which is the lesser failure — it costs tab
 * presses, where the other costs reachability.
 */
function Scale({ inToolbar }: { inToolbar: boolean }) {
  const group = (
    <ToggleGroup type="single" disallowEmptySelection defaultValue="days" aria-label="Scale">
      <ToggleGroupItem value="days">日</ToggleGroupItem>
      <ToggleGroupItem value="weeks">週</ToggleGroupItem>
      <ToggleGroupItem value="months">月</ToggleGroupItem>
    </ToggleGroup>
  );

  return inToolbar ? <div role="toolbar">{group}</div> : group;
}

const tabIndexes = () => screen.getAllByRole("radio").map((el) => el.getAttribute("tabindex"));

describe("ToggleGroup disallowEmptySelection inside a toolbar (gh#756)", () => {
  it("keeps EVERY option reachable when the arrows are disabled by the toolbar", () => {
    render(<Scale inToolbar />);

    // The role must survive: it is still a one-of-N setting, only the tab order changes.
    expect(screen.getByRole("radiogroup", { name: "Scale" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);

    // No `-1` anywhere: every option is its own tab stop, so all three are reachable.
    expect(tabIndexes().filter((value) => value === "-1")).toEqual([]);
  });

  it("still uses ONE roving tab stop when not nested in a toolbar", () => {
    render(<Scale inToolbar={false} />);

    // APG's radio pattern, unchanged where the arrows actually work.
    expect(tabIndexes()).toEqual(["0", "-1", "-1"]);
  });
});
