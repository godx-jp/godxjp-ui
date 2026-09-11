import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Checkbox } from "../checkbox";
import { Radio } from "../radio";
import { Segmented } from "../segmented";
import { Switch } from "../switch";

/**
 * THE INPUT'S WRAPPER IS OURS, NOT react-aria's `VisuallyHidden` (gh#476).
 *
 * react-aria hides the real `<input>` in a `VisuallyHidden` span whose geometry is an INLINE
 * style — 1px, clipped, at the label's top-left — so the box a user aims at belongs to the
 * `<label>` and a pointer never reaches the input. Measured in Chromium before the fix: of 49
 * points scanned over a 16x16 checkbox, 0 reached the input and 46 reached the label, and
 * Playwright `check()` without `force` timed out on "label intercepts pointer events".
 *
 * jsdom has no hit testing, so it cannot see any of that — `scripts/check-choice-hit-target.mjs`
 * measures it in a browser. What jsdom CAN pin is the STRUCTURE that fix depends on, and which
 * would break silently under a react-aria upgrade: the input's parent must be our own span (which
 * the stylesheet sizes to the painted box), carrying no inline style of react-aria's to fight.
 */
const CONTROLS = [
  ["Checkbox", () => <Checkbox aria-label="agree" />, "checkbox"],
  [
    "Radio",
    () => <Radio.Group options={[{ label: "Air", value: "air" }]} aria-label="Ship" />,
    "radio",
  ],
  ["Switch", () => <Switch aria-label="notify" />, "switch"],
  [
    "Segmented",
    () => <Segmented aria-label="view" options={[{ label: "Day", value: "day" }]} />,
    "radio",
  ],
] as const;

describe("choice controls own their hit target", () => {
  it.each(CONTROLS)("%s renders its input inside .ui-choice-input", (_name, render, role) => {
    renderWithUi(render());
    const input = screen.getAllByRole(role)[0];
    const wrapper = input.parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass("ui-choice-input");
    expect(wrapper).toHaveAttribute("data-slot", "choice-input");
    // react-aria's VisuallyHidden writes `position/width/height/clip/clip-path` inline, which no
    // stylesheet can outrank. Ours writes nothing — the geometry lives in control.css.
    expect(wrapper?.getAttribute("style")).toBeNull();
  });
});
