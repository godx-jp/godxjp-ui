import { describe, expect, it } from "vitest";

import { FormField } from "../form-field";
import { renderWithUi } from "@/test/render";

// FormField wires label (via aria-labelledby), helper (aria-describedby) and error
// (aria-errormessage + aria-invalid) onto a single control child. Every state must
// produce valid ARIA with the control properly named.
describe("FormField a11y", () => {
  it("preserves consumer descriptions and validation while adding field messages", () => {
    const { getByRole } = renderWithUi(
      <>
        <p id="external-help">External help</p>
        <p id="external-error">External error</p>
        <FormField id="merged" label="Name" helper="Field help" error="Field error">
          <input
            aria-describedby="external-help"
            aria-errormessage="external-error"
            aria-required="true"
          />
        </FormField>
      </>,
    );
    const input = getByRole("textbox", { name: "Name" });
    expect(input).toHaveAttribute("aria-describedby", "external-help merged-helper");
    expect(input).toHaveAttribute("aria-errormessage", "external-error merged-error");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
