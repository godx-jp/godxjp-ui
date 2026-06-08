import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { NumberInput } from "../number-input";

const field = () => screen.getByRole("spinbutton");

describe("NumberInput — typing edge cases", () => {
  it("a lone minus sign does not commit a value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput onValueChange={onValueChange} aria-label="n" />);
    await user.type(field(), "-");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("non-numeric text does not commit", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput onValueChange={onValueChange} aria-label="n" />);
    await user.type(field(), "abc");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("clearing to empty commits null", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput defaultValue={5} onValueChange={onValueChange} aria-label="n" />);
    await user.clear(field());
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("readOnly ignores typing", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <NumberInput defaultValue={3} readOnly onValueChange={onValueChange} aria-label="n" />,
    );
    await user.type(field(), "9");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
