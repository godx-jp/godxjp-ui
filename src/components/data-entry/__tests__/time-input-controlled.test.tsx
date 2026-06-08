import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { TimeInput } from "../time-input";

const field = () => screen.getByRole("spinbutton");

describe("TimeInput — controlled commit", () => {
  it("blur in controlled mode snaps + emits without mutating internal state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    // controlled value=09:07 with step 15 → blur snaps to 09:00 via the controlled commit path
    renderWithUi(
      <TimeInput value="09:07" step={15} onValueChange={onValueChange} aria-label="t" />,
    );
    field().focus();
    await user.tab();
    expect(onValueChange).toHaveBeenCalledWith("09:00"); // controlled commit path (no setInternal)
  });

  it("controlled value follows the prop after the parent commits", () => {
    const { rerender } = renderWithUi(
      <TimeInput value="09:00" onValueChange={vi.fn()} aria-label="t" />,
    );
    expect(field()).toHaveValue("09:00");
    rerender(<TimeInput value="14:30" onValueChange={vi.fn()} aria-label="t" />);
    expect(field()).toHaveValue("14:30");
  });
});
