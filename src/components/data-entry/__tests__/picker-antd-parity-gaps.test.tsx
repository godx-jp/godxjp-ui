import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent } from "@/test/render";

import { DatePicker } from "../date-picker";

/**
 * The two gaps `docs/roadmap/parity-audit-data-entry.md` files as **P1** for this component,
 * closed. Both are verified against Ant's own documentation rather than from memory:
 *
 *   `defaultPickerValue` — "Default panel date, will be reset when panel open"
 *   `pickerValue`        — "Panel date. Used for controlled switching of panel date"
 *   RangePicker `disabled: [boolean, boolean]` — start/end input disable states
 *
 * Spelled in this package's vocabulary where one exists; antd's own name kept where it does not,
 * per the rule stated on `TreeProp`. antd documents no `onPickerValueChange`, so none is invented.
 */

describe("defaultPickerValue — which period the panel OPENS on", () => {
  it("opens the period grid on it rather than on the value", async () => {
    renderWithUi(
      <DatePicker
        picker="month"
        aria-label="対象月"
        value={new Date(2020, 0, 1)}
        defaultPickerValue={new Date(2026, 0, 1)}
        defaultOpen
      />,
    );
    expect(await screen.findByRole("grid", { name: "2026" })).toBeInTheDocument();
  });

  it("opens the day grid on it too — one meaning at every granularity", async () => {
    renderWithUi(
      <DatePicker aria-label="日付" defaultPickerValue={new Date(2027, 3, 1)} defaultOpen />,
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(document.querySelector('[data-day="2027-04-01"]')).not.toBeNull();
  });

  it("is RE-APPLIED on every open, which is antd's wording, not only at mount", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DatePicker picker="month" aria-label="対象月" defaultPickerValue={new Date(2026, 0, 1)} />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("grid", { name: "2026" })).toBeInTheDocument();
    // Navigate away, close, reopen — the panel is back on 2026, not left on 2024.
    await user.click(screen.getByLabelText("Năm trước"));
    await user.click(screen.getByLabelText("Năm trước"));
    expect(screen.getByRole("grid", { name: "2024" })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("grid", { name: "2026" })).toBeInTheDocument();
  });

  it("without it the panel still follows the value at rest", async () => {
    renderWithUi(
      <DatePicker picker="month" aria-label="対象月" value={new Date(2020, 0, 1)} defaultOpen />,
    );
    expect(await screen.findByRole("grid", { name: "2020" })).toBeInTheDocument();
  });
});

describe("pickerValue — the CONTROLLED panel period", () => {
  it("wins over both defaultPickerValue and the value", async () => {
    renderWithUi(
      <DatePicker
        picker="month"
        aria-label="対象月"
        value={new Date(2020, 0, 1)}
        defaultPickerValue={new Date(2026, 0, 1)}
        pickerValue={new Date(2031, 0, 1)}
        defaultOpen
      />,
    );
    expect(await screen.findByRole("grid", { name: "2031" })).toBeInTheDocument();
  });

  it("freezes navigation — the parent owns the panel period", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DatePicker
        picker="month"
        aria-label="対象月"
        pickerValue={new Date(2031, 0, 1)}
        defaultOpen
      />,
    );
    await user.click(await screen.findByLabelText("Năm trước"));
    expect(screen.getByRole("grid", { name: "2031" })).toBeInTheDocument();
  });
});

describe("range + disabled: [from, to] — lock ONE endpoint", () => {
  const period = { from: new Date(2026, 2, 1), to: new Date(2026, 5, 30) };

  it("locks only the named edge and leaves the other editable", () => {
    renderWithUi(<DatePicker range aria-label="期間" value={period} disabled={[true, false]} />);
    expect(screen.getByLabelText("Từ")).toBeDisabled();
    expect(screen.getByLabelText("Đến")).not.toBeDisabled();
  });

  it("the control still opens while one edge is editable", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker range aria-label="期間" value={period} disabled={[true, false]} />);
    await user.click(screen.getByLabelText("Đến"));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("a locked edge keeps its committed value whatever is typed into the other", () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <DatePicker
        range
        aria-label="期間"
        value={period}
        disabled={[true, false]}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Đến"), { target: { value: "2026-09-30" } });
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: period.from,
      to: new Date(2026, 8, 30),
    });
  });

  it("the ✕ is withdrawn while EITHER edge is locked — clearing would wipe it", () => {
    renderWithUi(<DatePicker range aria-label="期間" value={period} disabled={[true, false]} />);
    expect(screen.queryByRole("button", { name: "Xóa" })).not.toBeInTheDocument();
  });

  it("[true, true] is exactly the scalar `disabled` — one code path, not two", () => {
    const tuple = renderWithUi(
      <DatePicker range aria-label="期間" value={period} disabled={[true, true]} defaultOpen />,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    for (const field of screen.getAllByRole("textbox")) expect(field).toBeDisabled();
    tuple.unmount();

    renderWithUi(<DatePicker range aria-label="期間" value={period} disabled defaultOpen />);
    expect(screen.queryByRole("dialog")).toBeNull();
    for (const field of screen.getAllByRole("textbox")) expect(field).toBeDisabled();
  });
});
