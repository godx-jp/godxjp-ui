import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Calendar } from "../calendar";
import { expectNoA11yViolations } from "@/test/a11y";

const MAY_2026 = new Date(2026, 4, 1);
// react-day-picker labels day buttons with the full date (aria-label), so query by visible text.
const dayCell = (n: string) => screen.getByText(n);

describe("Calendar", () => {
  it("renders a grid of days for the given month", () => {
    render(<Calendar mode="single" showOutsideDays={false} defaultMonth={MAY_2026} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(dayCell("15")).toBeInTheDocument();
  });

  it("single mode: clicking a day fires onSelect with a Date", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        showOutsideDays={false}
        defaultMonth={MAY_2026}
        onSelect={onSelect}
      />,
    );
    await user.click(dayCell("15"));
    expect(onSelect).toHaveBeenCalled();
    const [picked] = onSelect.mock.calls[0];
    expect(picked).toBeInstanceOf(Date);
    expect((picked as Date).getDate()).toBe(15);
  });

  it("shows the currently-selected day as selected", () => {
    render(
      <Calendar
        mode="single"
        showOutsideDays={false}
        selected={new Date(2026, 4, 20)}
        defaultMonth={MAY_2026}
      />,
    );
    const selected = screen.getByRole("grid").querySelector('[aria-selected="true"]');
    expect(selected).toHaveTextContent("20");
  });

  it("navigates to the next month via the nav button", async () => {
    const user = userEvent.setup();
    render(<Calendar mode="single" showOutsideDays={false} defaultMonth={MAY_2026} />);
    expect(dayCell("31")).toBeInTheDocument(); // May has 31 days
    const nextBtn = screen
      .getAllByRole("button")
      .find((b) => /next/i.test(b.getAttribute("aria-label") ?? ""));
    await user.click(nextBtn!);
    expect(screen.queryByText("31")).toBeNull(); // June has 30 days
  });

  it("range mode renders (resetOnSelect default applied)", () => {
    render(<Calendar mode="range" showOutsideDays={false} defaultMonth={MAY_2026} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("disabled days do not select", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        showOutsideDays={false}
        defaultMonth={MAY_2026}
        onSelect={onSelect}
        disabled={[{ before: new Date(2026, 4, 10) }]}
      />,
    );
    const five = within(screen.getByRole("grid")).queryByText("5");
    if (five) await user.click(five);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <Calendar mode="single" showOutsideDays={false} defaultMonth={MAY_2026} />,
    );
  });
});
