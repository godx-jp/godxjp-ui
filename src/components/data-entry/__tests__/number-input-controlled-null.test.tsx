import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { NumberInput } from "../number-input";

describe("NumberInput — controlled empty (value={null})", () => {
  it("treats an explicit null as controlled-but-empty (controlledValue ?? null branch)", () => {
    // value={null} is defined → controlled, and `controlledValue ?? null` resolves to null,
    // so the spinbutton has no current numeric value.
    renderWithUi(<NumberInput value={null} aria-label="qty" />);
    const field = screen.getByRole("spinbutton");
    expect(field).not.toHaveAttribute("aria-valuenow");
    expect(field).toHaveValue("");
  });
});
