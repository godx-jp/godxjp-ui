import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

import { TimeInput } from "../time-input";

const input = () => screen.getByRole("spinbutton");

describe("TimeInput — masking + snapping", () => {
  it("renders a spinbutton with day-minute range and HH:mm placeholder", () => {
    renderWithUi(<TimeInput />);
    expect(input()).toHaveAttribute("aria-valuemin", "0");
    expect(input()).toHaveAttribute("aria-valuemax", String(24 * 60 - 1));
    expect(input()).toHaveAttribute("placeholder", "HH:mm");
  });

  it("masks raw digits into HH:mm and emits the canonical value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimeInput onValueChange={onValueChange} />);
    await user.type(input(), "1330");
    expect(input()).toHaveValue("13:30");
    expect(onValueChange).toHaveBeenLastCalledWith("13:30");
  });

  it("snaps the minute down to the step on input", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimeInput step={15} onValueChange={onValueChange} />);
    await user.type(input(), "1340");
    // 40 floored to the nearest 15 below → 30
    expect(onValueChange).toHaveBeenLastCalledWith("13:30");
    expect(input()).toHaveValue("13:30");
  });

  it("reflects aria-valuenow/text for a valid value and aria-invalid for junk", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimeInput defaultValue="09:30" />);
    expect(input()).toHaveAttribute("aria-valuenow", String(9 * 60 + 30));
    expect(input()).toHaveAttribute("aria-valuetext", "09:30");
    await user.clear(input());
    await user.type(input(), "99");
    expect(input()).toHaveAttribute("aria-invalid", "true");
  });
});

describe("TimeInput — keyboard stepping", () => {
  it("ArrowUp/ArrowDown step by the configured minutes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimeInput defaultValue="09:00" step={15} onValueChange={onValueChange} />);
    input().focus();
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenLastCalledWith("09:15");
    await user.keyboard("{ArrowDown}");
    expect(onValueChange).toHaveBeenLastCalledWith("09:00");
  });

  it("ArrowUp wraps across midnight", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimeInput defaultValue="23:59" step={1} onValueChange={onValueChange} />);
    input().focus();
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenLastCalledWith("00:00");
  });
});

describe("TimeInput — blur / commit", () => {
  it("blur snaps a typed value and re-emits when the snap changed it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    // 09:07 with step 15 → blur snaps to 09:00 (value !== snapped path)
    renderWithUi(<TimeInput defaultValue="09:07" step={15} onValueChange={onValueChange} />);
    await user.click(input());
    await user.tab();
    expect(input()).toHaveValue("09:00");
    expect(onValueChange).toHaveBeenLastCalledWith("09:00");
  });

  it("blur on invalid text restores the last committed value", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimeInput defaultValue="" />);
    await user.type(input(), "99");
    await user.tab();
    // normalizeHhmm("99") is null → display resets to the (empty) committed value
    expect(input()).toHaveValue("");
  });

  it("Enter commits the current text", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimeInput step={15} onValueChange={onValueChange} />);
    await user.type(input(), "0807{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("08:00");
  });
});

describe("TimeInput — controlled + a11y", () => {
  it("controlled value follows the prop and never self-mutates", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = renderWithUi(<TimeInput value="10:00" onValueChange={onValueChange} />);
    expect(input()).toHaveValue("10:00");
    await user.clear(input());
    await user.type(input(), "1130");
    expect(onValueChange).toHaveBeenCalledWith("11:30");
    // still shows the controlled prop until the parent updates it
    rerender(<TimeInput value="11:30" onValueChange={onValueChange} />);
    expect(input()).toHaveValue("11:30");
  });

  it("has no a11y violations", async () => {
    await expectNoA11yViolations(<TimeInput defaultValue="09:30" aria-label="開始時刻" />);
  });
});
