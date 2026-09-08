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
  //
  // The role no longer names the painted element. react-aria builds Checkbox as a `<label>`
  // wrapping a visually hidden real `<input>`, so `getByRole("checkbox")` returns that input while
  // the border, the background and `.ui-checkbox` all live on the label. The box is resolved
  // through `[data-slot="checkbox"]` — the same hop `theme-axes-integration` uses for the same
  // reason.
  it("Checkbox matches the ring selector and carries no hand-written ring utility", () => {
    renderWithUi(<Checkbox aria-label="Agree" />);
    const input = screen.getByRole("checkbox", { name: "Agree" });
    const box = input.closest('[data-slot="checkbox"]')!;

    expect(box.matches(shadowFormSelector())).toBe(true);
    expect(box.className).not.toMatch(/focus-visible:ring-/);
  });

  // Membership in the `:is()` list above is necessary but NOT sufficient any more, and the gap is
  // silent: `:focus-visible` matches the focused element, and the focused element is now the inner
  // `<input>` — never the label that carries `.ui-checkbox`. So the entry in that list can be
  // present, the test above green, and the ring still invisible to every keyboard user.
  //
  // react-aria mirrors its own focus-visible state onto the root as `data-focus-visible`, and
  // `focus-ring.css` hangs a second selector off it. This pins that second selector, because it is
  // the one that actually fires.
  it("Checkbox gets its ring from the data-focus-visible hook, not :focus-visible", () => {
    expect(FOCUS_RING_CSS).toMatch(/\.ui-checkbox\[data-focus-visible\]/);

    renderWithUi(<Checkbox aria-label="Agree" />);
    const box = screen.getByRole("checkbox", { name: "Agree" }).closest('[data-slot="checkbox"]')!;

    // Not focused: the hook is absent, so the ring rule must not apply.
    expect(box.matches(".ui-checkbox[data-focus-visible]")).toBe(false);

    box.setAttribute("data-focus-visible", "true");
    expect(box.matches(".ui-checkbox[data-focus-visible]")).toBe(true);
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
