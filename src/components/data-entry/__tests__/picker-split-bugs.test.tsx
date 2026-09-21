import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent } from "@/test/render";

import { DatePicker } from "../date-picker";

/**
 * FOUR BUGS THE SPLIT CREATED — and the merge is the fix for all four.
 *
 * Each was first captured against the four-component tree, where every one of them was RED:
 *
 *   bug 1  <MonthPicker disabled open />                → the grid rendered over a dead field
 *   bug 1  <MonthRangePicker disabled open />           → same
 *   bug 2  fromYear/toYear + a grid click               → committed an out-of-range month
 *   bug 2  fromYear/toYear + typing                     → committed an out-of-range month
 *   bug 3  MonthPicker + Enter                          → nothing happened, panel stayed open
 *   bug 3  MonthRangePicker + Enter                     → same
 *   bug 3  DateRangePicker + Enter                      → same
 *   bug 4  <MonthPicker name="…" />                     → submitted "2026/03"
 *
 * Every one of those four contracts was ALREADY correct in `DatePicker` and wrong in at least one
 * of its three copies — which is the whole argument for there being one component. The tests below
 * are the same eight cases re-aimed at the merged control, so a future re-split has to break them.
 */

describe("bug 1 — a disabled picker must not open, controlled `open` or not", () => {
  it("picker=month: disabled + open renders no grid", () => {
    renderWithUi(<DatePicker picker="month" aria-label="対象月" disabled open />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("range + picker=month: disabled + open renders no grid", () => {
    renderWithUi(<DatePicker range picker="month" aria-label="対象期間" disabled open />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("bug 2 — bounds must clamp the VALUE, not just the year chevrons", () => {
  it("a month outside [minDate, maxDate] is not clickable in the grid", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <DatePicker
        picker="month"
        aria-label="対象月"
        minDate={new Date(2026, 0, 1)}
        maxDate={new Date(2026, 11, 31)}
        defaultValue={new Date(2020, 0, 1)}
        onValueChange={onValueChange}
        defaultOpen
      />,
    );
    // The grid opens on 2020 — six years below the clamp. Under the old `fromYear`/`toYear` this
    // greyed the chevron and left all twelve cells live.
    const cells = screen.getByRole("grid").querySelectorAll("button");
    expect(cells[2]).toBeDisabled();
    await user.click(cells[2]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("a month outside the bounds cannot be TYPED in either", () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <DatePicker
        picker="month"
        aria-label="対象月"
        minDate={new Date(2026, 0, 1)}
        maxDate={new Date(2026, 11, 31)}
        onValueChange={onValueChange}
      />,
    );
    const field = screen.getByRole("combobox");
    fireEvent.change(field, { target: { value: "2020-03" } });
    expect(onValueChange).not.toHaveBeenCalled();
    // …and an in-range one still commits, so the rule is a clamp and not a wall.
    fireEvent.change(field, { target: { value: "2026-03" } });
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 2, 1));
  });
});

describe("bug 3 — Enter commits and closes, on every shell", () => {
  it("picker=month: Enter commits the typed month and closes the grid", async () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <DatePicker picker="month" aria-label="対象月" defaultOpen onValueChange={onValueChange} />,
    );
    const field = screen.getByRole("combobox");
    fireEvent.change(field, { target: { value: "2025-11" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2025, 10, 1));
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("range + picker=month: Enter closes the grid", async () => {
    renderWithUi(<DatePicker range picker="month" aria-label="対象期間" defaultOpen />);
    fireEvent.keyDown(screen.getByLabelText("Từ"), { key: "Enter" });
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("range: Enter commits the typed edge and closes the calendar", async () => {
    const onValueChange = vi.fn();
    renderWithUi(<DatePicker range aria-label="期間" defaultOpen onValueChange={onValueChange} />);
    const from = screen.getByLabelText("Từ");
    fireEvent.change(from, { target: { value: "2026-03-04" } });
    fireEvent.keyDown(from, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 2, 4), to: undefined });
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});

describe("bug 4 — the native form value is ISO-8601 at the picker's own precision", () => {
  function submitted(ui: React.ReactElement, key: string) {
    const { container } = renderWithUi(<form>{ui}</form>);
    return new FormData(container.querySelector("form") as HTMLFormElement).get(key);
  }

  it("picker=month submits yyyy-MM, not yyyy/MM", () => {
    expect(
      submitted(
        <DatePicker
          picker="month"
          aria-label="対象月"
          name="billing"
          value={new Date(2026, 2, 1)}
        />,
        "billing",
      ),
    ).toBe("2026-03");
  });

  it("picker=year submits yyyy", () => {
    expect(
      submitted(
        <DatePicker picker="year" aria-label="年度" name="fy" value={new Date(2026, 0, 1)} />,
        "fy",
      ),
    ).toBe("2026");
  });

  it("picker=date is unchanged — yyyy-MM-dd", () => {
    expect(
      submitted(<DatePicker aria-label="日付" name="due" value={new Date(2026, 2, 4)} />, "due"),
    ).toBe("2026-03-04");
  });

  it("range + picker=month submits both edges as yyyy-MM", () => {
    const { container } = renderWithUi(
      <form>
        <DatePicker
          range
          picker="month"
          aria-label="対象期間"
          name="term"
          value={{ from: new Date(2026, 2, 1), to: new Date(2026, 5, 1) }}
        />
      </form>,
    );
    const data = new FormData(container.querySelector("form") as HTMLFormElement);
    expect(data.get("term_from")).toBe("2026-03");
    expect(data.get("term_to")).toBe("2026-06");
  });
});

/**
 * The two prop collisions the merge had to settle, pinned so a later "clean-up" cannot quietly
 * flip either back. The reasons live in the props file and in `date-picker.tsx`.
 */
describe("prop collisions, settled", () => {
  it("inputReadOnly locks the KEYBOARD, not the picker (antd's meaning)", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker picker="month" aria-label="対象月" inputReadOnly />);
    const field = screen.getByRole("combobox");
    expect(field).toHaveAttribute("readonly");
    // The two month pickers refused to open here, which made `inputReadOnly` a second `disabled`
    // and left "pick by grid only" inexpressible.
    await user.click(field);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("order normalises ascending — a SWAP on a range", () => {
    const onValueChange = vi.fn();
    renderWithUi(<DatePicker range aria-label="期間" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByLabelText("Từ"), { target: { value: "2026-06-10" } });
    fireEvent.change(screen.getByLabelText("Đến"), { target: { value: "2026-03-04" } });
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 2, 4),
      to: new Date(2026, 5, 10),
    });
  });

  it("order normalises ascending — a SORT on a multiple selection", () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <DatePicker
        multiple
        aria-label="日付"
        defaultValue={[new Date(2026, 5, 10)]}
        onValueChange={onValueChange}
        defaultOpen
      />,
    );
    fireEvent.click(document.querySelector(`[data-day="2026-06-04"] button`) as HTMLElement);
    expect(onValueChange).toHaveBeenLastCalledWith([new Date(2026, 5, 4), new Date(2026, 5, 10)]);
  });

  it("order={false} keeps the endpoints as picked", () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <DatePicker range order={false} aria-label="期間" onValueChange={onValueChange} />,
    );
    fireEvent.change(screen.getByLabelText("Từ"), { target: { value: "2026-06-10" } });
    fireEvent.change(screen.getByLabelText("Đến"), { target: { value: "2026-03-04" } });
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 5, 10),
      to: new Date(2026, 2, 4),
    });
  });
});
