import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "../input";
import { FormField } from "../form-field";

/**
 * A STATUS ROW WHOSE ONLY DIFFERENCE IS ITS WORDING IS NOT A STATUS ROW.
 *
 * Reported from the published docs site, and both halves were real:
 *
 *   · the glyph used `controlIconClass` — `size-[length:var(--control-height)]`, the height of a
 *     whole CONTROL, meant for something filling a control-sized box like the ColorPicker swatch.
 *     Beside a 12px feedback line that is a ~32px icon. It rides `--form-feedback-icon-size` now,
 *     measured at 14px against 12.47px text.
 *   · all four states — 確認済み / 確認中 / 注意 / エラー — drew in the SAME inherited ink, so the
 *     icon was carrying meaning colour should have shared. WCAG 1.4.1 is about the inverse of this
 *     and it does not excuse it: the text tier is what the error line one element below already
 *     uses, for the contrast reason gh#610 records.
 *
 * AND THE BOX NEVER SHOWED ITS OWN STATE. `error` reached the control through `aria-invalid`;
 * `warning` reached nothing, so a warned field drew an ordinary border and the only signal was a
 * sentence underneath. `.ui-control[data-status]` has painted both edges for a long time —
 * FormField simply never passed the value down.
 *
 * jsdom applies no stylesheet, so the COLOURS are proven in the browser (measured: warning
 * rgb(143,86,0) on a rgb(250,183,0) border; error rgb(184,40,48)). What is asserted here is the
 * wiring those rules select on, which is the part a refactor can silently drop.
 */
describe("validation feedback carries its status to the row AND the control", () => {
  it.each(["success", "warning", "error", "validating"] as const)(
    "marks the %s row so the tone rule can select it",
    (status) => {
      const { container } = render(
        <FormField id={`f-${status}`} label="メール" validateStatus={status} hasFeedback>
          <Input id={`f-${status}`} aria-label="メール" />
        </FormField>,
      );
      const row = container.querySelector(".ui-form-feedback");
      expect(row, "the feedback row needs its own class for the tone rules").not.toBeNull();
      expect(row?.getAttribute("data-status")).toBe(status);
    },
  );

  /* `ControlStatusProp` is exactly error | warning, so those two reach the box and the other two
   * cannot. Asserting the absence matters as much: it is the documented limit, not an oversight. */
  it.each([
    ["error", "error"],
    ["warning", "warning"],
    ["success", null],
    ["validating", null],
  ] as const)("passes %s to the control as data-status=%s", (status, expected) => {
    const { container } = render(
      <FormField id={`c-${status}`} label="メール" validateStatus={status} hasFeedback>
        <Input id={`c-${status}`} aria-label="メール" />
      </FormField>,
    );
    expect(container.querySelector(".ui-control")?.getAttribute("data-status")).toBe(expected);
  });

  it("does not overwrite a status the child set for itself", () => {
    const { container } = render(
      <FormField id="own" label="メール" validateStatus="warning" hasFeedback>
        <Input id="own" aria-label="メール" status="error" />
      </FormField>,
    );
    expect(container.querySelector(".ui-control")?.getAttribute("data-status")).toBe("error");
  });

  /* The glyph must not be sized off the CONTROL height — that is the reported defect exactly. */
  it("sizes the glyph from the icon scale, never the control height", () => {
    const { container } = render(
      <FormField id="icon" label="メール" validateStatus="success" hasFeedback>
        <Input id="icon" aria-label="メール" />
      </FormField>,
    );
    const svg = container.querySelector(".ui-form-feedback svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class") ?? "").not.toMatch(/var\(\s*--control-height\)/);
  });
});
