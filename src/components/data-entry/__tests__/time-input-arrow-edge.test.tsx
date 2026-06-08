import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { TimeInput } from "../time-input";

const field = () => screen.getByRole("spinbutton");

describe("TimeInput — arrow stepping edge cases", () => {
  it("steps from 00:00 when the current display is not a valid time", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimeInput step={1} onValueChange={onValueChange} aria-label="t" />);
    await user.type(field(), "9"); // invalid partial display, no committed value
    await user.keyboard("{ArrowUp}");
    // base falls back to value || "00:00" → 00:00 + 1 = 00:01
    expect(onValueChange).toHaveBeenLastCalledWith("00:01");
  });

  it("arrow stepping in controlled mode emits without mutating internal state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimeInput value="10:00" step={5} onValueChange={onValueChange} aria-label="t" />);
    field().focus();
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenLastCalledWith("10:05");
  });
});
