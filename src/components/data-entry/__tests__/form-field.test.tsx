import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { FormField } from "../form-field";
import { Input } from "../input";

describe("FormField", () => {
  it("links label to input via htmlFor/id", () => {
    renderWithUi(
      <FormField id="email" label="Email">
        <Input id="email" />
      </FormField>,
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email");
  });

  it("shows required asterisk when required", () => {
    renderWithUi(
      <FormField id="name" label="Name" required>
        <Input id="name" />
      </FormField>,
    );
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-required", "true");
  });

  it("shows helper text and wires aria-describedby", () => {
    renderWithUi(
      <FormField id="x" label="Field" helper="Hint text">
        <Input id="x" />
      </FormField>,
    );
    const input = screen.getByRole("textbox");
    expect(screen.getByText("Hint text")).toHaveAttribute("id", "x-helper");
    expect(input).toHaveAttribute("aria-describedby", "x-helper");
  });

  it("shows error instead of helper and sets aria-invalid", () => {
    renderWithUi(
      <FormField id="x" label="Field" helper="Hint" error="Required">
        <Input id="x" />
      </FormField>,
    );
    const input = screen.getByRole("textbox");
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.queryByText("Hint")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "x-error");
  });
});
