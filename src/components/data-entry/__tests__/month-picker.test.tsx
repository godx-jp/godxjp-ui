import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { MonthPicker } from "../month-picker";

describe("MonthPicker", () => {
  it("renders the value as yyyy/MM and always carries an id", () => {
    render(<MonthPicker value={new Date(2026, 5, 1)} onValueChange={() => {}} />);
    const input = screen.getByDisplayValue("2026/06");
    expect(input).toHaveAttribute("id");
  });

  it("commits a complete typed yyyy/MM", () => {
    const onValueChange = vi.fn();
    render(<MonthPicker onValueChange={onValueChange} />);
    const input = screen.getByPlaceholderText("yyyy/mm");
    fireEvent.change(input, { target: { value: "2025/11" } });
    expect(onValueChange).toHaveBeenCalledWith(new Date(2025, 10, 1));
  });

  it("ignores partial input and clears on empty", () => {
    const onValueChange = vi.fn();
    render(<MonthPicker onValueChange={onValueChange} />);
    const input = screen.getByPlaceholderText("yyyy/mm");
    fireEvent.change(input, { target: { value: "2025/1" } });
    expect(onValueChange).toHaveBeenCalledWith(new Date(2025, 0, 1));
    fireEvent.change(input, { target: { value: "2025/13" } });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    fireEvent.change(input, { target: { value: "" } });
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it("opens the grid and picks a month in the navigated year", () => {
    const onValueChange = vi.fn();
    render(<MonthPicker value={new Date(2026, 0, 1)} onValueChange={onValueChange} />);
    fireEvent.click(screen.getAllByRole("textbox")[0]);
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
    render(<MonthPicker value={new Date(2026, 5, 1)} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByLabelText("Xóa"));
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });

  it("ArrowDown on the input opens the month grid", () => {
    render(<MonthPicker value={new Date(2026, 0, 1)} onValueChange={() => {}} />);
    const input = screen.getByDisplayValue("2026/01");
    expect(screen.queryByRole("grid")).toBeNull();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("Escape closes the open grid", () => {
    render(<MonthPicker value={new Date(2026, 0, 1)} onValueChange={() => {}} />);
    const input = screen.getByDisplayValue("2026/01");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("grid")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("grid")).toBeNull();
  });

  it("navigates to the next year via the chevron", () => {
    const onValueChange = vi.fn();
    render(<MonthPicker value={new Date(2026, 0, 1)} onValueChange={onValueChange} />);
    fireEvent.click(screen.getAllByRole("textbox")[0]);
    fireEvent.click(screen.getByLabelText("Năm sau"));
    expect(screen.getByText("2027")).toBeInTheDocument();
    const cells = screen.getByRole("grid").querySelectorAll("button");
    fireEvent.click(cells[5]); // June
    expect(onValueChange).toHaveBeenCalledWith(new Date(2027, 5, 1));
  });

  it("resets an invalid typed value back to the controlled value on blur", () => {
    // value stays pinned (controlled, onValueChange ignored), so blur snaps the
    // field text back to the controlled value's yyyy/MM.
    render(<MonthPicker value={new Date(2026, 5, 1)} onValueChange={() => {}} />);
    const input = screen.getByDisplayValue("2026/06");
    fireEvent.change(input, { target: { value: "garbage" } }); // invalid → text retained, no emit
    expect(input).toHaveValue("garbage");
    fireEvent.blur(input);
    expect(input).toHaveValue("2026/06");
  });

  it("respects fromYear/toYear by disabling the year chevrons at the bounds", () => {
    render(
      <MonthPicker value={new Date(2026, 0, 1)} onValueChange={() => {}} fromYear={2026} toYear={2026} />,
    );
    fireEvent.click(screen.getAllByRole("textbox")[0]);
    expect(screen.getByLabelText("Năm trước")).toBeDisabled();
    expect(screen.getByLabelText("Năm sau")).toBeDisabled();
  });

  it("hides the clear affordance when allowClear is false", () => {
    render(<MonthPicker value={new Date(2026, 5, 1)} onValueChange={() => {}} allowClear={false} />);
    expect(screen.queryByLabelText("Xóa")).toBeNull();
  });

  it("does not open on click or show clear when disabled", () => {
    render(<MonthPicker value={new Date(2026, 5, 1)} onValueChange={() => {}} disabled />);
    expect(screen.queryByLabelText("Xóa")).toBeNull();
    fireEvent.click(screen.getByDisplayValue("2026/06"));
    expect(screen.queryByRole("grid")).toBeNull();
  });

  it("seeds uncontrolled state from defaultValue", () => {
    render(<MonthPicker defaultValue={new Date(2024, 2, 1)} />);
    expect(screen.getByDisplayValue("2024/03")).toBeInTheDocument();
  });
});
