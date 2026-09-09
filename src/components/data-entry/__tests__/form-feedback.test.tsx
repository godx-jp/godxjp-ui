import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Form } from "../form";
import { FormField } from "../form-field";
import { Flex } from "../../layout/flex";
import { Input } from "../input";

describe("Form field feedback", () => {
  it("disables nested controls without changing their values", () => {
    renderWithUi(
      <Form disabled>
        <FormField label="Names">
          <Flex>
            <Input aria-label="First" defaultValue="Ada" />
            <Input aria-label="Last" defaultValue="Lovelace" />
          </Flex>
        </FormField>
      </Form>,
    );
    expect(screen.getByRole("textbox", { name: "First" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Last" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "First" })).toHaveValue("Ada");
  });

  it("distinguishes warnings and pending checks from invalid values", () => {
    const { rerender } = renderWithUi(
      <FormField label="Email" hasFeedback validateStatus="warning">
        <Input />
      </FormField>,
    );
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("status")).toHaveTextContent(/kiểm tra|review|確認/);
    rerender(
      <FormField label="Email" hasFeedback validateStatus="validating">
        <Input />
      </FormField>,
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("textbox").getAttribute("aria-describedby")).toBe(
      screen.getByRole("status").id,
    );
  });
  it("error messages take precedence over success feedback", () => {
    renderWithUi(
      <FormField label="Email" error="Already used" hasFeedback validateStatus="success">
        <Input />
      </FormField>,
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Already used");
  });
  it("disables form fields and supports optional required marking", () => {
    renderWithUi(
      <Form disabled requiredMark="optional">
        <FormField label="Notes">
          <Input />
        </FormField>
      </Form>,
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByText(/không bắt buộc|optional|任意/)).toBeVisible();
  });
});
