import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { NumberInput } from "../number-input";

const field = () => screen.getByRole("spinbutton");

describe("NumberInput — step base + inferred precision", () => {
  it("steps from 0 with a decimal step, inferring precision from the step", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    // no value, no min, no precision → base = 0, precision inferred from step (0.5 → 1 dp)
    renderWithUi(<NumberInput step={0.5} onValueChange={onValueChange} aria-label="n" />);
    field().focus();
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenLastCalledWith(0.5);
  });

  it("steps from min when there is no value (base = min)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput min={10} onValueChange={onValueChange} aria-label="n" />);
    field().focus();
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenLastCalledWith(11); // base = null ?? min(10) → 11
  });
});
