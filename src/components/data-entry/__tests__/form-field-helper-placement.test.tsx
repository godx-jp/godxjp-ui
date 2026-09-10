import { describe, expect, it } from "vitest";

import { FormField } from "../form-field";
import { Input } from "../input";
import { renderWithUi, screen } from "@/test/render";

/**
 * A bilingual form puts its secondary line ABOVE the input — the reader needs it before they
 * answer, not after. `labelAddon` cannot carry that (an inline, no-wrap row beside the label,
 * sized for a chip), and a ReactNode `label` costs the string-label fallbacks. So the helper
 * itself moves.
 *
 * These assert DOM ORDER against the control found by role, never a class.
 */
describe("FormField — helperPlacement", () => {
  const helper = "半角英数字で入力 / Alphanumeric only";

  it("renders the helper after the control by default", () => {
    renderWithUi(
      <FormField label="社員番号" helper={helper}>
        <Input />
      </FormField>,
    );
    const control = screen.getByRole("textbox", { name: "社員番号" });
    const text = screen.getByText(helper);
    expect(control.compareDocumentPosition(text) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders the helper before the control when asked", () => {
    renderWithUi(
      <FormField label="社員番号" helper={helper} helperPlacement="before">
        <Input />
      </FormField>,
    );
    const control = screen.getByRole("textbox", { name: "社員番号" });
    const text = screen.getByText(helper);
    expect(control.compareDocumentPosition(text) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  it("keeps the helper on aria-describedby at either placement", () => {
    const { rerender } = renderWithUi(
      <FormField label="社員番号" helper={helper}>
        <Input />
      </FormField>,
    );
    const describedByAfter = screen
      .getByRole("textbox", { name: "社員番号" })
      .getAttribute("aria-describedby");
    expect(describedByAfter).toBeTruthy();
    expect(document.getElementById(describedByAfter!.split(" ")[0])).toHaveTextContent(helper);

    rerender(
      <FormField label="社員番号" helper={helper} helperPlacement="before">
        <Input />
      </FormField>,
    );
    const describedByBefore = screen
      .getByRole("textbox", { name: "社員番号" })
      .getAttribute("aria-describedby");
    expect(describedByBefore).toBeTruthy();
    expect(document.getElementById(describedByBefore!.split(" ")[0])).toHaveTextContent(helper);
  });

  it("renders exactly one helper node (no duplicate id)", () => {
    renderWithUi(
      <FormField label="社員番号" helper={helper} helperPlacement="before">
        <Input />
      </FormField>,
    );
    expect(screen.getAllByText(helper)).toHaveLength(1);
  });
});
