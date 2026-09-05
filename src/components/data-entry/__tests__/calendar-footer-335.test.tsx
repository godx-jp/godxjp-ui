import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Calendar } from "../calendar";
import { DatePicker } from "../date-picker";
import { expectNoA11yViolations } from "@/test/a11y";

const TODAY = new Date(2026, 8, 5);
// The library defaults to the vi catalogue outside an AppProvider.
const TODAY_LABEL = "Hôm nay";
const CLOSE_LABEL = "Đóng";
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

describe("Calendar footer (gh#335)", () => {
  it("renders no footer by default", () => {
    render(<Calendar mode="single" today={TODAY} />);
    expect(screen.queryByRole("button", { name: TODAY_LABEL })).toBeNull();
    expect(screen.queryByRole("button", { name: CLOSE_LABEL })).toBeNull();
  });

  it("single: Today selects today and moves the grid to the current month", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        today={TODAY}
        defaultMonth={new Date(2024, 0, 1)}
        onSelect={onSelect}
        showToday
      />,
    );
    await user.click(screen.getByRole("button", { name: TODAY_LABEL }));
    expect(sameDay(onSelect.mock.calls[0][0] as Date, TODAY)).toBe(true);
    expect(screen.getByRole("grid").getAttribute("aria-label")).toMatch(/September 2026/);
  });

  it("range: Today fills the open end of the range", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const from = new Date(2026, 8, 1);
    render(
      <Calendar mode="range" today={TODAY} selected={{ from }} onSelect={onSelect} showToday />,
    );
    await user.click(screen.getByRole("button", { name: TODAY_LABEL }));
    const next = onSelect.mock.calls[0][0] as { from: Date; to: Date };
    expect(sameDay(next.from, from)).toBe(true);
    expect(sameDay(next.to, TODAY)).toBe(true);
  });

  it("Today is disabled when today is outside the allowed dates", () => {
    render(
      <Calendar
        mode="single"
        today={TODAY}
        endMonth={new Date(2026, 5, 30)}
        disabled={{ after: new Date(2026, 5, 30) }}
        showToday
      />,
    );
    expect(screen.getByRole("button", { name: TODAY_LABEL })).toBeDisabled();
  });

  it("Close calls onClose and `footer` replaces the actions", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(
      <Calendar mode="single" today={TODAY} showClose onClose={onClose} />,
    );
    await user.click(screen.getByRole("button", { name: CLOSE_LABEL }));
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(<Calendar mode="single" today={TODAY} showClose footer={<span>custom</span>} />);
    expect(screen.queryByRole("button", { name: CLOSE_LABEL })).toBeNull();
    expect(screen.getByText("custom")).toBeInTheDocument();
  });

  it("DatePicker forwards showToday / showClose and Close shuts the popover", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DatePicker name="due" showToday showClose onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("button", { name: TODAY_LABEL })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: CLOSE_LABEL }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("button", { name: TODAY_LABEL }));
    expect(sameDay(onValueChange.mock.calls[0][0] as Date, new Date())).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("has no a11y violations with the footer on", async () => {
    await expectNoA11yViolations(
      <Calendar mode="single" today={TODAY} showToday showClose onClose={() => {}} />,
    );
  });
});
