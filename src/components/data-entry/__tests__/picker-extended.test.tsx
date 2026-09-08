import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { within, fireEvent } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { DatePicker } from "../date-picker";
import { DateRangePicker } from "../date-range-picker";
import { TimePicker } from "../time-picker";
import { TimeRangePicker } from "../time-range-picker";

describe("Picker precision and display", () => {
  it("date-time seconds remain visible and survive Enter", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    const date = new Date(2026, 8, 9, 17, 50, 15);
    renderWithUi(
      <DatePicker showTime={{ showSeconds: true }} defaultValue={date} onValueChange={change} />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("2026-09-09 17:50:15");
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith(date);
  });
  it("date-time typing cannot commit a forbidden hour without confirmation", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    renderWithUi(
      <DatePicker
        showTime={{ disabledTime: () => ({ disabledHours: () => [9] }) }}
        needConfirm={false}
        onValueChange={change}
      />,
    );
    const input = screen.getByRole("combobox");
    await user.type(input, "2026-09-09 09:00");
    await user.tab();
    expect(change).not.toHaveBeenCalled();
    expect(input).toHaveValue("");
  });
  it("disabled formatted fields do not submit hidden native values", () => {
    const { container } = renderWithUi(
      <form>
        <DatePicker disabled name="date" format="yyyy/MM/dd" defaultValue={new Date(2026, 8, 9)} />
        <TimePicker disabled name="time" format="h:mm A" defaultValue="13:00" />
        <DateRangePicker
          disabled
          name="range"
          format="yyyy/MM/dd"
          defaultValue={{ from: new Date(2026, 8, 9) }}
        />
      </form>,
    );
    expect([...new FormData(container.querySelector("form")!).entries()]).toEqual([]);
  });
  it("stages seconds and commits only on confirmation", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    renderWithUi(
      <TimePicker
        defaultValue="17:50:15"
        showSeconds
        secondStep={15}
        needConfirm
        onValueChange={change}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const seconds = screen.getAllByRole("listbox")[2];
    expect(within(seconds).getAllByRole("option")).toHaveLength(4);
    await user.click(within(seconds).getByRole("option", { name: "30" }));
    expect(change).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Chọn" }));
    expect(change).toHaveBeenLastCalledWith("17:50:30");
  });
  it("wheel selection is opt-in and leaves the panel open", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    renderWithUi(<TimePicker defaultValue="09:00" changeOnScroll onValueChange={change} />);
    await user.click(screen.getByRole("combobox"));
    fireEvent.wheel(screen.getAllByRole("listbox")[1], { deltaY: 100 });
    expect(change).toHaveBeenLastCalledWith("09:05");
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
  });
  it("typing with confirmation commits the visible draft, not the old time", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    renderWithUi(<TimePicker defaultValue="09:00" needConfirm onValueChange={change} />);
    await user.clear(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "10:45");
    expect(change).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Chọn" }));
    expect(change).toHaveBeenLastCalledWith("10:45");
  });
  it("typed seconds do not emit a partial minute value or bypass disabledSeconds", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    renderWithUi(
      <TimePicker
        showSeconds
        disabledTime={() => ({ disabledSeconds: () => [30] })}
        onValueChange={change}
      />,
    );
    await user.type(screen.getByRole("combobox"), "09:15:30");
    expect(change).not.toHaveBeenCalled();
    await user.clear(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "09:15:45");
    expect(change).toHaveBeenLastCalledWith("09:15:45");
  });
  it("12-hour display submits a single canonical native value", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <form>
        <TimePicker id="start" name="start" format="h:mm A" defaultValue="13:30" />
      </form>,
    );
    expect(screen.getByRole("combobox")).toHaveValue("1:30 PM");
    await user.clear(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "2:45 PM");
    await user.tab();
    expect(screen.getByRole("combobox")).toHaveValue("2:45 PM");
    expect(new FormData(container.querySelector("form")!).getAll("start")).toEqual(["14:45"]);
  });
  it("custom date format types without freezing and submits ISO", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <form>
        <DatePicker name="date" format="yyyy年MM月dd日" />
      </form>,
    );
    await user.type(screen.getByRole("combobox"), "2026年09月09日");
    expect(screen.getByRole("combobox")).toHaveValue("2026年09月09日");
    expect(new FormData(container.querySelector("form")!).getAll("date")).toEqual(["2026-09-09"]);
  });
  it("fromDate and toDate also constrain typed dates", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    renderWithUi(
      <DatePicker
        fromDate={new Date(2026, 8, 10)}
        toDate={new Date(2026, 8, 20)}
        onValueChange={change}
      />,
    );
    await user.type(screen.getByRole("combobox"), "2026-09-09");
    await user.tab();
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox")).toHaveValue("");
  });
  it("multiple dates remain draft until confirmed", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    renderWithUi(
      <DatePicker
        multiple
        needConfirm
        defaultValue={[new Date(2026, 8, 9)]}
        onValueChange={change}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("button", { name: /11/ }));
    expect(change).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Chọn" }));
    expect(change.mock.lastCall?.[0].map((d: Date) => d.getDate())).toEqual([9, 11]);
  });
  it.each(["month", "quarter", "year"] as const)("selects %s periods", async (picker) => {
    const user = userEvent.setup(),
      change = vi.fn();
    renderWithUi(
      <DatePicker picker={picker} defaultValue={new Date(2026, 8, 9)} onValueChange={change} />,
    );
    await user.click(screen.getByRole("combobox"));
    const cells = screen
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("aria-pressed"));
    await user.click(cells[1]);
    const date = change.mock.lastCall?.[0];
    expect(date.getDate()).toBe(1);
    expect(date.getMonth()).toBe(picker === "year" ? 0 : picker === "quarter" ? 3 : 1);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "false");
  });
  it("date presets preserve time and require confirmation", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    const date = new Date(2026, 8, 10, 14, 30);
    renderWithUi(
      <DatePicker
        showTime
        presets={[{ label: "Tomorrow", value: () => date }]}
        onValueChange={change}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("button", { name: "Tomorrow" }));
    expect(change).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Chọn" }));
    expect(change).toHaveBeenLastCalledWith(date);
  });
  it("controlled visibility reports close without mutating parent state", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    renderWithUi(<TimePicker open onOpenChange={change} />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Escape}");
    expect(change).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
  });
  it("controlled time range opens only the active endpoint", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimeRangePicker open defaultValue={["09:00", "17:00"]} />);
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    await user.click(screen.getAllByRole("combobox")[1]);
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getAllByRole("combobox")[1]).toHaveAttribute("aria-expanded", "true");
  });
  it("time range permits overnight order and cannot clear required endpoints", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    renderWithUi(
      <TimeRangePicker
        defaultValue={["22:00", "06:00"]}
        order={false}
        allowEmpty={[false, true]}
        onValueChange={change}
      />,
    );
    expect(screen.getAllByRole("button", { name: "Xóa" })).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Xóa" }));
    expect(change).toHaveBeenLastCalledWith(["22:00", ""]);
  });
  it("range presets enforce bounds and allow an open endpoint", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    renderWithUi(
      <DateRangePicker
        needConfirm
        allowEmpty={[false, true]}
        minDate={new Date(2026, 8, 1)}
        presets={[
          { label: "Open", value: { from: new Date(2026, 8, 9) } },
          { label: "Forbidden", value: { from: new Date(2025, 8, 9) } },
        ]}
        onValueChange={change}
      />,
    );
    await user.click(screen.getAllByRole("textbox")[0]);
    await user.click(screen.getByRole("button", { name: "Forbidden" }));
    expect(screen.getByRole("button", { name: "Chọn" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(screen.getByRole("button", { name: "Chọn" }));
    expect(change.mock.lastCall?.[0].from.getDate()).toBe(9);
    expect(change.mock.lastCall?.[0].to).toBeUndefined();
  });
});
