import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { NumberInput } from "../number-input";

const field = () => screen.getByRole("spinbutton");

describe("NumberInput — stepper hit-target classes", () => {
  it("tags each stepper with directional classes for ::after anchoring (gh#506)", () => {
    const { container } = renderWithUi(<NumberInput defaultValue={1} aria-label="数量" />);
    const steps = container.querySelectorAll(".ui-number-input-step");
    expect(steps).toHaveLength(2);
    expect(steps[0]).toHaveClass("ui-number-input-step-up");
    expect(steps[1]).toHaveClass("ui-number-input-step-down");
  });
});

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
