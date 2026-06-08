import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { TimeInput } from "../time-input";

const field = () => screen.getByRole("spinbutton");

describe("TimeInput — non-finite step", () => {
  it("an Infinity step is clamped to 1 minute (non-finite guard)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <TimeInput
        defaultValue="09:00"
        step={Infinity}
        onValueChange={onValueChange}
        aria-label="t"
      />,
    );
    field().focus();
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenLastCalledWith("09:01"); // clampStep !isFinite → 1
  });
});
