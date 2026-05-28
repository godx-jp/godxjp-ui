import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Input } from "../input";
import { Textarea } from "../textarea";

describe("Input", () => {
  it("accepts typed value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<Input aria-label="test" onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "abc");
    expect(onChange).toHaveBeenCalled();
  });

  it("applies ui-control class", () => {
    renderWithUi(<Input aria-label="test" />);
    expect(screen.getByRole("textbox")).toHaveClass("ui-control");
  });

  it("exposes shadcn data-slot and invalid state classes", () => {
    renderWithUi(<Input aria-label="test" aria-invalid />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("data-slot", "input");
    expect(input).toHaveClass("aria-invalid:border-destructive");
  });
});

describe("Textarea", () => {
  it("renders multiline control", () => {
    renderWithUi(<Textarea aria-label="notes" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("applies ui-control-multiline class", () => {
    renderWithUi(<Textarea aria-label="notes" />);
    expect(screen.getByRole("textbox")).toHaveClass("ui-control-multiline");
  });
});
