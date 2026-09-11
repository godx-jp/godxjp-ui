import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";

import { NumberInput } from "../number-input";
import { FormField } from "../form-field";

/**
 * THE STEPPERS ARE NAMED AFTER THE FIELD THEY STEP.
 *
 * They used to be a bare verb — 「増やす」 / 「減らす」 — which is unique on a page with one numeric
 * field and useless on a page with several. Counted in Chromium on
 * /isolate/data-entry-number-input: 16 buttons named 「増やす」 and 16 named 「減らす」, on a page
 * where every field has a distinct name (数量, 評価, 目標金額, 重量, 価格…). The steppers are
 * `tabIndex={-1}`, so this is not a tab-order problem: it is what a screen-reader user gets when
 * they list the buttons, which is precisely the audience that cannot see which field a button sits
 * beside (WCAG 2.4.6).
 *
 * The name is composed out of whatever already names the FIELD, so no consumer passes anything:
 * `aria-labelledby` when an element names it (ARIA's own precedence — a field carrying both is
 * named by the element), `aria-label` when a string does, and the bare verb when nothing does.
 *
 * Locale under renderWithUi is vi (fallback en).
 */
const steppers = (container: HTMLElement) => [
  ...container.querySelectorAll(".ui-number-input-step"),
];

/** Resolve an accessible name the way AT does for the two shapes this component emits. */
function accessibleName(el: Element): string {
  const by = el.getAttribute("aria-labelledby");
  if (by) {
    return by
      .split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id)?.textContent?.trim() ?? "")
      .filter(Boolean)
      .join(" ");
  }
  return el.getAttribute("aria-label") ?? el.textContent?.trim() ?? "";
}

describe("NumberInput — stepper names", () => {
  it("composes from the field's aria-label when a string names the field", () => {
    const { container } = renderWithUi(<NumberInput aria-label="Số lượng" defaultValue={1} />);
    const names = steppers(container).map(accessibleName);

    expect(names).toHaveLength(2);
    for (const name of names) expect(name).toContain("Số lượng");
    expect(new Set(names).size).toBe(2);
  });

  it("composes through aria-labelledby when an ELEMENT names the field", () => {
    const { container } = renderWithUi(
      <FormField label="Số lượng thùng">
        <NumberInput defaultValue={1} />
      </FormField>,
    );
    const [up] = steppers(container);

    // The stepper must point at the field's own label source, not at a copy of the text.
    const field = container.querySelector("[data-slot=number-input-field]")!;
    expect(field.getAttribute("aria-labelledby")).toBeTruthy();
    expect(up.getAttribute("aria-labelledby")).toContain(field.getAttribute("aria-labelledby")!);
    expect(accessibleName(up)).toContain("Số lượng thùng");
  });

  it("prefers aria-labelledby over aria-label, the way ARIA resolves a name", () => {
    // A field carrying both is named by the ELEMENT, so composing from the string would announce a
    // stepper for a field name the user never hears. Measured on the preview, where the stories
    // pass both: the field read 「評価 (1–5)」 and the stepper was composing from 「評価」.
    const { container } = renderWithUi(
      <FormField label="Đánh giá (1–5)">
        <NumberInput aria-label="Đánh giá" defaultValue={1} />
      </FormField>,
    );
    const [up] = steppers(container);

    expect(up.getAttribute("aria-label")).toBeNull();
    expect(accessibleName(up)).toContain("(1–5)");
  });

  it("keeps the bare verb when nothing names the field", () => {
    const { container } = renderWithUi(<NumberInput defaultValue={1} />);
    const names = steppers(container).map((el) => el.getAttribute("aria-label"));

    expect(names.every((n) => !!n)).toBe(true);
    expect(new Set(names).size).toBe(2);
  });

  it("puts two NumberInputs' four steppers on four different names", () => {
    // The defect, in miniature: one page, several numeric fields.
    const { container } = renderWithUi(
      <>
        <NumberInput aria-label="Chiều rộng" defaultValue={1} />
        <NumberInput aria-label="Chiều cao" defaultValue={1} />
      </>,
    );
    const names = steppers(container).map(accessibleName);

    expect(names).toHaveLength(4);
    expect(new Set(names).size, `duplicate stepper names: ${names.join(" / ")}`).toBe(4);
  });
});
