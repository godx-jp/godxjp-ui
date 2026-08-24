import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Button } from "../button";
import { Checkbox } from "../../data-entry/checkbox";

/**
 * The single-source test next door proves the ring rule SAYS the right thing.
 * This one proves it REACHES the elements — the distinction that let a rule sit
 * in the file, correct-looking, while the browser painted its own blue default
 * (the pagination defect) or nothing at all (Checkbox, whose Tailwind
 * `shadow-xs` outranked the components layer).
 *
 * Selectors are extracted FROM the shipped CSS, never retyped: a retyped copy
 * stays green when the stylesheet changes. Per the invariant in
 * src/test/css-selector.ts, the `.matches()` calls are NOT wrapped in
 * try/catch — an invalid selector must throw loudly rather than read as
 * "matches nothing".
 */

const FOCUS_RING_CSS = readFileSync(join(__dirname, "../../../styles/focus-ring.css"), "utf8");

/** The shadow-form `:is(...)` list, WITHOUT the `:focus-visible` state.
 *
 * The state is what the browser adds on keyboard focus; jsdom does not compute
 * it, and the question here is membership — "is this element in the ring's
 * selector at all" — not "is it focused right now". Stripping only the trailing
 * pseudo keeps the class list itself extracted from the shipped CSS. */
function shadowFormSelector(): string {
  const match = FOCUS_RING_CSS.match(/:is\(([^)]*\.ui-button[^)]*)\):focus-visible/s);
  expect(match, "shadow-form :is() rule not found in focus-ring.css").not.toBeNull();

  return `:is(${match![1]})`;
}

describe("focus ring — reaches real elements", () => {
  // Button is the reference control: whatever ring the system draws, it draws here.
  it("the shadow-form selector matches a rendered Button", () => {
    renderWithUi(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });

    expect(button.matches(shadowFormSelector())).toBe(true);
  });

  // Checkbox is the control that had NO visible ring: the rule existed in the
  // components layer but `shadow-xs` (utilities) won the box-shadow. It must
  // both match the selector AND no longer carry a hand-written ring utility.
  it("Checkbox matches the ring selector and carries no hand-written ring utility", () => {
    renderWithUi(<Checkbox aria-label="Agree" />);
    const box = screen.getByRole("checkbox", { name: "Agree" });

    expect(box.matches(shadowFormSelector())).toBe(true);
    expect(box.className).not.toMatch(/focus-visible:ring-/);
  });

  // The opt-in class is how a NEW component joins the system without editing
  // the `:is()` list. If it stops being part of the selector, the documented
  // extension point is gone.
  it("the opt-in .ui-focus-ring class is part of the shadow-form selector", () => {
    renderWithUi(
      <button type="button" className="ui-focus-ring">
        opt-in
      </button>,
    );
    const el = screen.getByRole("button", { name: "opt-in" });

    expect(el.matches(shadowFormSelector())).toBe(true);
  });
});
