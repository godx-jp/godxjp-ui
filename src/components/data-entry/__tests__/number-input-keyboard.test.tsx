import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { NumberInput } from "../number-input";

const field = () => screen.getByRole("spinbutton");

describe("NumberInput — keyboard commit", () => {
  it("Shift + ArrowDown steps down by ×10", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <NumberInput defaultValue={100} step={1} onValueChange={onValueChange} aria-label="qty" />,
    );
    field().focus();
    await user.keyboard("{Shift>}{ArrowDown}{/Shift}");
    expect(onValueChange).toHaveBeenLastCalledWith(90);
  });

  it("Enter commits the typed value and formats it at rest", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput onValueChange={onValueChange} aria-label="qty" />);
    await user.type(field(), "42");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(42);
    expect(field()).toHaveValue("42");
  });

  it("Enter on an empty field commits null", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput defaultValue={5} onValueChange={onValueChange} aria-label="qty" />);
    await user.clear(field());
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });
});
