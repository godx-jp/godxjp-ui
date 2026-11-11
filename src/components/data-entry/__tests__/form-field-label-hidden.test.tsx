import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { FormField } from "../form-field";
import { Input } from "../input";

describe("FormField labelHidden", () => {
  it("keeps the label as the accessible name while hiding it visually", () => {
    const { container } = renderWithUi(
      <FormField label="Device code" labelHidden>
        <Input />
      </FormField>,
    );
    expect(screen.getByRole("textbox", { name: "Device code" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="form-field-label"]')).toHaveClass("sr-only");
    expect(container.querySelector('[data-slot="form-field"]')).toHaveAttribute(
      "data-label-hidden",
      "",
    );
  });

  it("is inert by default", () => {
    const { container } = renderWithUi(
      <FormField label="Email">
        <Input />
      </FormField>,
    );
    expect(container.querySelector('[data-slot="form-field-label"]')).not.toHaveClass("sr-only");
    expect(container.querySelector('[data-slot="form-field"]')).not.toHaveAttribute(
      "data-label-hidden",
    );
  });
});
