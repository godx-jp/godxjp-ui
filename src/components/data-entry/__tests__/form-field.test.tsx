import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
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

  it("shows helper and error together and wires aria-invalid + aria-errormessage", () => {
    renderWithUi(
      <FormField id="x" label="Field" helper="Hint" error="Required">
        <Input id="x" />
      </FormField>,
    );
    const input = screen.getByRole("textbox");
    // Helper and error now coexist: the error no longer replaces the helper.
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.getByText("Hint")).toBeInTheDocument();
    // The control is marked invalid and points to the error via aria-errormessage,
    // while the helper stays associated through aria-describedby.
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-errormessage", "x-error");
    expect(input).toHaveAttribute("aria-describedby", "x-helper");
  });

  it("clicking the label focuses a direct control that carries the field id", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <FormField id="email" label="Email">
        <Input id="email" />
      </FormField>,
    );
    await user.click(screen.getByText("Email"));
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("clicking the label focuses the first real control inside a composite wrapper", async () => {
    const user = userEvent.setup();
    // The field id lands on a plain wrapper div (composite child) → the handler must
    // query the first focusable control inside it, not focus the wrapper itself.
    renderWithUi(
      <FormField id="grp" label="Group">
        <div id="grp">
          <span>not focusable</span>
          <input type="text" aria-label="inner" />
        </div>
      </FormField>,
    );
    await user.click(screen.getByText("Group"));
    expect(screen.getByLabelText("inner")).toHaveFocus();
  });

  it("clicking the label is a no-op when the field id resolves to nothing", async () => {
    const user = userEvent.setup();
    // id given but no child carries it → getElementById returns null → early return.
    renderWithUi(
      <FormField id="orphan" label="Orphan">
        <Input id="different" />
      </FormField>,
    );
    await user.click(screen.getByText("Orphan"));
    expect(screen.getByRole("textbox")).not.toHaveFocus();
  });

  it("warns in development when given a non-element child", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderWithUi(<FormField label="Plain">just text</FormField>);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("FormField expects a single React element"),
    );
    warn.mockRestore();
  });

  it("auto-generates an id and injects it into the child when none is given", () => {
    renderWithUi(
      <FormField label="Auto">
        <Input />
      </FormField>,
    );
    const input = screen.getByRole("textbox");
    expect(input.id).toBeTruthy();
    expect(input).toHaveAttribute("aria-labelledby", `${input.id}-label`);
  });
});

describe("FormField staticText (gh#294 — a read-only VALUE row on the same Form)", () => {
  it("renders plain text with Descriptions.Item's exact value typography, no <input>", () => {
    renderWithUi(<FormField label="Name" staticText="ANH THU NGO" />);
    const value = screen.getByText("ANH THU NGO");
    expect(value.tagName).toBe("SPAN");
    expect(value.className).toContain("text-sm");
    expect(value.className).toContain("break-all");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("never warns about a missing element child — staticText is not a control to a11y-wire", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderWithUi(<FormField label="Name" staticText="ANH THU NGO" />);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("still renders helper/error rows beside a static value", () => {
    renderWithUi(<FormField label="Name" staticText="ANH THU NGO" helper="Legal name" error="Stale" />);
    expect(screen.getByText("Legal name")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Stale");
  });

  it("accepts arbitrary ReactNode, not just strings", () => {
    renderWithUi(
      <FormField label="Status" staticText={<strong data-testid="badge">Active</strong>} />,
    );
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });
});
