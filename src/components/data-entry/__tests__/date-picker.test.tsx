import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

import { DatePicker } from "../date-picker";

const field = () => screen.getByRole("combobox");
const iso = (d: Date | undefined) =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    : "";

describe("DatePicker — typing", () => {
  it("commits only a complete yyyy-MM-dd value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<DatePicker onValueChange={onValueChange} />);
    await user.type(field(), "2026-03-20");
    expect(onValueChange).toHaveBeenCalled();
    expect(iso(onValueChange.mock.calls.at(-1)![0])).toBe("2026-03-20");
  });

  it("does not commit a partial date", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<DatePicker onValueChange={onValueChange} />);
    await user.type(field(), "2026-03");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("clearing the field emits undefined", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<DatePicker defaultValue={new Date(2026, 2, 20)} onValueChange={onValueChange} />);
    await user.clear(field());
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it("blur reverts an unparseable entry to the committed value", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker defaultValue={new Date(2026, 2, 20)} />);
    // append junk (no clear — clearing would commit undefined); the garbage never
    // matches the complete-date regex, so the committed value stays 2026-03-20
    await user.type(field(), "xyz");
    await user.tab();
    expect(field()).toHaveValue("2026-03-20"); // reverted on blur
  });
});

describe("DatePicker — calendar popover", () => {
  it("ArrowDown opens the calendar and Escape closes it", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker defaultValue={new Date(2026, 5, 1)} />);
    await user.type(field(), "{ArrowDown}");
    expect(field()).toHaveAttribute("aria-expanded", "true");
    await user.type(field(), "{Escape}");
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("selecting a day commits the date, mirrors the text and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<DatePicker defaultValue={new Date(2026, 5, 1)} onValueChange={onValueChange} />);
    await user.click(field());
    await user.click(screen.getByText("15")); // June 15, 2026 (mid-month, never an outside day)
    expect(iso(onValueChange.mock.calls.at(-1)![0])).toBe("2026-06-15");
    expect(field()).toHaveValue("2026-06-15");
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("fromDate disables earlier days in the calendar", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DatePicker defaultValue={new Date(2026, 5, 20)} fromDate={new Date(2026, 5, 10)} />,
    );
    await user.click(field());
    // day 8 is before the fromDate boundary (10) → disabled (unique, not an outside day)
    expect(screen.getByText("8").closest("button")).toBeDisabled();
  });
});

describe("DatePicker — a11y + disabled", () => {
  it("disabled field cannot be opened", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker disabled defaultValue={new Date(2026, 5, 1)} />);
    expect(field()).toBeDisabled();
    await user.click(field());
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("has no a11y violations", async () => {
    await expectNoA11yViolations(
      <DatePicker defaultValue={new Date(2026, 5, 1)} aria-label="日付" />,
    );
  });
});
