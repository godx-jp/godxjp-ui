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

it("keeps a selected range readable at every position, including the middle", async () => {
  /*
   * From #423, and kept for the reason it was written: a selected middle cell paints an accent
   * fill while the day is a ghost `<button>` that sets its OWN foreground, so the label was
   * rendering dark-on-accent and failing contrast.
   *
   * The ORIGINAL assertions pinned the Tailwind utilities that fixed it
   * (`aria-selected:[&>button:hover]:text-accent-foreground` and five siblings). They cannot
   * survive here: 20.0.0 moved every day state out of utilities on the `<td>` and into
   * `control.css`, precisely because a utility on the cell cannot reach the label inside the
   * button — the same defect from the other side. Pinning them would also trip
   * `check:no-tailwind-class-assertions`, which this repo added for exactly this shape of test.
   *
   * So what is pinned is the CONTRACT the utilities were serving, measured by axe on all three
   * range positions at once. It is the stronger of the two: it fails whether the regression
   * arrives through a class, a utility, or a token.
   */
  const range = { from: new Date(2026, 4, 10), to: new Date(2026, 4, 14) };
  const { container } = render(
    <Calendar mode="range" selected={range} defaultMonth={MAY_2026} showOutsideDays={false} />,
  );

  const middle = container.querySelector('[data-day="2026-05-12"]')!;
  expect(middle).toHaveAttribute("aria-selected", "true");
  // The three positions are distinct states, not one blanket "selected" — the middle carries the
  // accent fill, the endpoints the primary one, and #423 was a middle-only defect.
  expect(middle).toHaveClass("day-range-middle");
  expect(container.querySelector('[data-day="2026-05-10"]')).toHaveClass("day-range-start");
  expect(container.querySelector('[data-day="2026-05-14"]')).toHaveClass("day-range-end");
  expect(container.querySelector('[data-day="2026-05-10"]')).not.toHaveClass("day-range-middle");

  await expectNoA11yViolations(
    <Calendar mode="range" selected={range} defaultMonth={MAY_2026} showOutsideDays={false} />,
  );
});
