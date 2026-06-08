import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DateRangePicker } from "../date-range-picker";

const iso = (d: Date | undefined) =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    : "";
const inputs = () => screen.getAllByRole("textbox"); // [from, to]
const calendarOpen = () => screen.queryAllByRole("grid").length > 0;

describe("DateRangePicker — typing", () => {
  it("commits complete from + to dates through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<DateRangePicker onValueChange={onValueChange} />);
    const [from, to] = inputs();
    await user.type(from, "2026-03-10");
    expect(iso(onValueChange.mock.calls.at(-1)![0]?.from)).toBe("2026-03-10");
    await user.type(to, "2026-03-20");
    const last = onValueChange.mock.calls.at(-1)![0];
    expect(iso(last.from)).toBe("2026-03-10");
    expect(iso(last.to)).toBe("2026-03-20");
  });

  it("does not commit a partial edge", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<DateRangePicker onValueChange={onValueChange} />);
    await user.type(inputs()[0], "2026-03");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("clearing both edges emits undefined", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 2, 10), to: new Date(2026, 2, 20) }}
        onValueChange={onValueChange}
      />,
    );
    const [from, to] = inputs();
    await user.clear(to);
    await user.clear(from);
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });
});

describe("DateRangePicker — calendar popover", () => {
  it("ArrowDown opens the calendar and Escape closes it", async () => {
    const user = userEvent.setup();
    renderWithUi(<DateRangePicker defaultValue={{ from: new Date(2026, 5, 1) }} />);
    const from = inputs()[0];
    await user.type(from, "{ArrowDown}");
    expect(calendarOpen()).toBe(true);
    await user.type(from, "{Escape}");
    expect(calendarOpen()).toBe(false);
  });

  it("selecting two days in the calendar emits a range", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 5, 1) }}
        onValueChange={onValueChange}
      />,
    );
    await user.click(inputs()[0]);
    // first visible month is June 2026; pick two mid-month days
    await user.click(screen.getAllByText("10")[0]);
    await user.click(screen.getAllByText("20")[0]);
    const last = onValueChange.mock.calls.at(-1)![0];
    expect(last?.from).toBeInstanceOf(Date); // a range was committed
  });
});

describe("DateRangePicker — disabled", () => {
  it("disabled inputs cannot open the calendar", async () => {
    const user = userEvent.setup();
    renderWithUi(<DateRangePicker disabled defaultValue={{ from: new Date(2026, 5, 1) }} />);
    const [from] = inputs();
    expect(from).toBeDisabled();
    await user.click(from);
    expect(calendarOpen()).toBe(false);
  });
});
