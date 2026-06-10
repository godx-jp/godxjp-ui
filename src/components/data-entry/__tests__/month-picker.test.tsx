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
    fireEvent.click(screen.getByLabelText("Mở chọn tháng"));
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
});
