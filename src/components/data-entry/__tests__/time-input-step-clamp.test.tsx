import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { TimeInput } from "../time-input";

const field = () => screen.getByRole("spinbutton");

describe("TimeInput — step clamping", () => {
  it("a zero/falsy step falls back to 1 minute", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <TimeInput defaultValue="09:00" step={0} onValueChange={onValueChange} aria-label="t" />,
    );
    field().focus();
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenLastCalledWith("09:01"); // step coerced to 1
  });

  it("a step above 59 is clamped to 59", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <TimeInput defaultValue="00:00" step={100} onValueChange={onValueChange} aria-label="t" />,
    );
    field().focus();
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenLastCalledWith("00:59"); // clamped to 59
  });
});
