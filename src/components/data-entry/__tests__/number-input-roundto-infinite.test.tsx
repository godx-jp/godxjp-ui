import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { NumberInput } from "../number-input";

describe("NumberInput — non-finite roundTo", () => {
  it("stepping with an Infinity step does not crash (roundTo !isFinite guard)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput step={Infinity} onValueChange={onValueChange} aria-label="n" />);
    screen.getByRole("spinbutton").focus();
    // base(0) + Infinity → commit(Infinity) → roundTo hits its !Number.isFinite branch
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenCalled();
  });
});
