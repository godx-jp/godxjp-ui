import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker } from "../date-picker";

/**
 * `<DatePicker picker="month" />` — the control that used to be a separate `MonthPicker`.
 * Same contract, two deliberate differences: the field reads and accepts ISO `yyyy-MM` rather than
 * `yyyy/MM`, and the bounds are `minDate`/`maxDate` rather than `fromYear`/`toYear`.
 */
describe("DatePicker picker=month", () => {
  it("renders the value as ISO yyyy-MM and always carries an id", () => {
    render(<DatePicker picker="month" value={new Date(2026, 5, 1)} onValueChange={() => {}} />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("2026-06");
    expect(input).toHaveAttribute("id");
  });

  it("commits a complete typed yyyy-MM", () => {
    const onValueChange = vi.fn();
    render(<DatePicker picker="month" onValueChange={onValueChange} />);
    const input = screen.getByPlaceholderText("Chọn tháng");
    fireEvent.change(input, { target: { value: "2025-11" } });
    expect(onValueChange).toHaveBeenCalledWith(new Date(2025, 10, 1));
  });

  it("ignores partial input and clears on empty", () => {
    const onValueChange = vi.fn();
    render(<DatePicker picker="month" onValueChange={onValueChange} />);
    const input = screen.getByPlaceholderText("Chọn tháng");
    fireEvent.change(input, { target: { value: "2025-1" } });
    expect(onValueChange).toHaveBeenCalledWith(new Date(2025, 0, 1));
    fireEvent.change(input, { target: { value: "2025-13" } });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    fireEvent.change(input, { target: { value: "" } });
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it("opens the grid and picks a month in the navigated year", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker picker="month" value={new Date(2026, 0, 1)} onValueChange={onValueChange} />,
    );
    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByLabelText("Năm trước"));
    expect(screen.getByText("2025")).toBeInTheDocument();
    // 12 month cells inside the grid
    const grid = screen.getByRole("grid");
    const cells = grid.querySelectorAll("button");
    expect(cells).toHaveLength(12);
    fireEvent.click(cells[2]); // March
    expect(onValueChange).toHaveBeenCalledWith(new Date(2025, 2, 1));
  });

  it("clears via the inline x", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker picker="month" value={new Date(2026, 5, 1)} onValueChange={onValueChange} />,
    );
    fireEvent.click(screen.getByLabelText("Xóa"));
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });

  it("ArrowDown on the input opens the month grid", () => {
    render(<DatePicker picker="month" value={new Date(2026, 0, 1)} onValueChange={() => {}} />);
    const input = screen.getByRole("combobox");
    expect(screen.queryByRole("grid")).toBeNull();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("Escape closes the open grid", () => {
    render(<DatePicker picker="month" value={new Date(2026, 0, 1)} onValueChange={() => {}} />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("grid")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("grid")).toBeNull();
  });

  it("navigates to the next year via the chevron", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker picker="month" value={new Date(2026, 0, 1)} onValueChange={onValueChange} />,
    );
    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByLabelText("Năm sau"));
    expect(screen.getByText("2027")).toBeInTheDocument();
    const cells = screen.getByRole("grid").querySelectorAll("button");
    fireEvent.click(cells[5]); // June
    expect(onValueChange).toHaveBeenCalledWith(new Date(2027, 5, 1));
  });

  it("resets an invalid typed value back to the controlled value on blur", () => {
    // value stays pinned (controlled, onValueChange ignored), so blur snaps the
    // field text back to the controlled value's yyyy-MM.
    render(<DatePicker picker="month" value={new Date(2026, 5, 1)} onValueChange={() => {}} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "garbage" } }); // invalid → text retained, no emit
    expect(input).toHaveValue("garbage");
    fireEvent.blur(input);
    expect(input).toHaveValue("2026-06");
  });

  it("minDate/maxDate clamp the CELLS, and grey a chevron whose whole page is out of bounds", () => {
    render(
      <DatePicker
        picker="month"
        value={new Date(2026, 0, 1)}
        onValueChange={() => {}}
        minDate={new Date(2026, 0, 1)}
        maxDate={new Date(2026, 11, 31)}
      />,
    );
    fireEvent.click(screen.getAllByRole("combobox")[0]);
    // 2025 and 2027 are entirely outside [minDate, maxDate], so both chevrons are dead…
    expect(screen.getByLabelText("Năm trước")).toBeDisabled();
    expect(screen.getByLabelText("Năm sau")).toBeDisabled();
    // …and every cell inside the visible year is live, because 2026 IS in bounds.
    const cells = screen.getByRole("grid").querySelectorAll("button");
    expect([...cells].every((cell) => !cell.hasAttribute("disabled"))).toBe(true);
  });

  it("a partial year bound clamps only the months outside it", () => {
    render(
      <DatePicker
        picker="month"
        value={new Date(2026, 5, 1)}
        onValueChange={() => {}}
        minDate={new Date(2026, 3, 1)}
      />,
    );
    fireEvent.click(screen.getAllByRole("combobox")[0]);
    const cells = screen.getByRole("grid").querySelectorAll("button");
    expect(cells[2]).toBeDisabled(); // March — before minDate
    expect(cells[3]).not.toBeDisabled(); // April — the bound itself
  });

  it("hides the clear affordance when allowClear is false", () => {
    render(
      <DatePicker
        picker="month"
        value={new Date(2026, 5, 1)}
        onValueChange={() => {}}
        allowClear={false}
      />,
    );
    expect(screen.queryByLabelText("Xóa")).toBeNull();
  });

  it("does not open on click or show clear when disabled", () => {
    render(
      <DatePicker picker="month" value={new Date(2026, 5, 1)} onValueChange={() => {}} disabled />,
    );
    expect(screen.queryByLabelText("Xóa")).toBeNull();
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("grid")).toBeNull();
  });

  it("seeds uncontrolled state from defaultValue", () => {
    render(<DatePicker picker="month" defaultValue={new Date(2024, 2, 1)} />);
    expect(screen.getByRole("combobox")).toHaveValue("2024-03");
  });
});
