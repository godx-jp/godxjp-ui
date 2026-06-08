import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { NumberInput } from "../number-input";

const field = () => screen.getByRole("spinbutton");

describe("NumberInput — controlled typing + NaN blur", () => {
  it("controlled: typing emits onValueChange without mutating internal state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput value={5} onValueChange={onValueChange} aria-label="n" />);
    await user.clear(field());
    await user.type(field(), "7");
    expect(onValueChange).toHaveBeenLastCalledWith(7); // isControlled → no setInternal
  });

  it("blurring non-numeric text commits null", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput defaultValue={3} onValueChange={onValueChange} aria-label="n" />);
    await user.clear(field());
    await user.type(field(), "abc");
    await user.tab(); // blur → parsed NaN → commit(null)
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });
});
