import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { MonthRangePicker } from "../month-range-picker";

describe("MonthRangePicker", () => {
  it("renders both edges as yyyy/MM in ONE control and always carries ids", () => {
    render(
      <MonthRangePicker
        value={{ from: new Date(2026, 0, 1), to: new Date(2026, 5, 1) }}
        onValueChange={() => {}}
      />,
    );
    const from = screen.getByDisplayValue("2026/01");
    const to = screen.getByDisplayValue("2026/06");
    expect(from).toHaveAttribute("id");
    expect(to).toHaveAttribute("id");
    // One shared shell: both inputs live inside the same bordered container.
    expect(from.parentElement).toBe(to.parentElement);
  });

  it("emits ${name}_from / ${name}_to form fields", () => {
    render(
      <MonthRangePicker
        name="search_negotiation_ym"
        value={{ from: new Date(2026, 0, 1), to: new Date(2026, 5, 1) }}
        onValueChange={() => {}}
      />,
    );
    expect(screen.getByDisplayValue("2026/01")).toHaveAttribute(
      "name",
      "search_negotiation_ym_from",
    );
    expect(screen.getByDisplayValue("2026/06")).toHaveAttribute("name", "search_negotiation_ym_to");
  });

  it("commits a complete typed yyyy/MM on either edge", () => {
    const onValueChange = vi.fn();
    render(<MonthRangePicker onValueChange={onValueChange} />);
    const [from, to] = screen.getAllByPlaceholderText("yyyy/mm");
    fireEvent.change(from, { target: { value: "2025/11" } });
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2025, 10, 1), to: undefined });
    fireEvent.change(to, { target: { value: "2026/02" } });
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2025, 10, 1),
      to: new Date(2026, 1, 1),
    });
  });

  it("normalizes a backwards typed range (from > to swaps — never emits an inverted range)", () => {
    const onValueChange = vi.fn();
    render(
      <MonthRangePicker
        defaultValue={{ from: new Date(2026, 5, 1), to: undefined }}
        onValueChange={onValueChange}
      />,
    );
    const [, to] = screen.getAllByPlaceholderText("yyyy/mm");
    fireEvent.change(to, { target: { value: "2026/01" } });
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 0, 1),
      to: new Date(2026, 5, 1),
    });
  });

  it("ignores partial input (no mid-type mangling) and clears on empty", () => {
    const onValueChange = vi.fn();
    render(<MonthRangePicker onValueChange={onValueChange} />);
    const [from] = screen.getAllByPlaceholderText("yyyy/mm");
    fireEvent.change(from, { target: { value: "2025/13" } });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(from).toHaveValue("2025/13");
    fireEvent.change(from, { target: { value: "2025/03" } });
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2025, 2, 1), to: undefined });
    fireEvent.change(from, { target: { value: "" } });
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it("two-step grid pick: from then to, closing the popover on completion", () => {
    const onValueChange = vi.fn();
    render(<MonthRangePicker onValueChange={onValueChange} />);
    fireEvent.click(screen.getByLabelText("Mở chọn tháng"));
    const cells = screen.getByRole("grid").querySelectorAll("button");
    const year = new Date().getFullYear();
    fireEvent.click(cells[2]); // March — starts the range
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(year, 2, 1), to: undefined });
    fireEvent.click(cells[8]); // September — completes it
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(year, 2, 1),
      to: new Date(year, 8, 1),
    });
    // The completing pick must CLOSE the popover — a grid click bubbling to the
    // shell's open-on-click would re-open it (the bug this guards against).
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("swaps a backwards grid pick (validate: from ≤ to)", () => {
    const onValueChange = vi.fn();
    render(
      <MonthRangePicker
        defaultValue={{ from: new Date(2026, 8, 1), to: undefined }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Mở chọn tháng"));
    const cells = screen.getByRole("grid").querySelectorAll("button");
    fireEvent.click(cells[1]); // February < September → swapped
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 1, 1),
      to: new Date(2026, 8, 1),
    });
  });

  it("reset-on-complete: a pick on a COMPLETE range starts a new one (no stuck start)", () => {
    const onValueChange = vi.fn();
    render(
      <MonthRangePicker
        defaultValue={{ from: new Date(2026, 2, 1), to: new Date(2026, 8, 1) }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Mở chọn tháng"));
    const cells = screen.getByRole("grid").querySelectorAll("button");
    fireEvent.click(cells[10]); // November — must START a new range, not extend
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 1),
      to: undefined,
    });
  });

  it("value-at-rest: the grid opens on the held range's year", () => {
    render(
      <MonthRangePicker
        value={{ from: new Date(2023, 3, 1), to: new Date(2023, 7, 1) }}
        onValueChange={() => {}}
      />,
    );
    fireEvent.click(screen.getByLabelText("Mở chọn tháng"));
    expect(screen.getByText("2023")).toBeInTheDocument();
  });

  it("clamps year navigation to fromYear/toYear", () => {
    render(
      <MonthRangePicker
        value={{ from: new Date(2026, 0, 1), to: undefined }}
        onValueChange={() => {}}
        fromYear={2026}
        toYear={2026}
      />,
    );
    fireEvent.click(screen.getByLabelText("Mở chọn tháng"));
    expect(screen.getByLabelText("Năm trước")).toBeDisabled();
    expect(screen.getByLabelText("Năm sau")).toBeDisabled();
  });

  it("clears the whole range via the inline x", () => {
    const onValueChange = vi.fn();
    render(
      <MonthRangePicker
        value={{ from: new Date(2026, 0, 1), to: new Date(2026, 5, 1) }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Xóa"));
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });

  it("disabled blocks typing, the grid trigger and hides clear", () => {
    render(
      <MonthRangePicker
        value={{ from: new Date(2026, 0, 1), to: new Date(2026, 5, 1) }}
        onValueChange={() => {}}
        disabled
      />,
    );
    expect(screen.getByDisplayValue("2026/01")).toBeDisabled();
    expect(screen.getByLabelText("Mở chọn tháng")).toBeDisabled();
    expect(screen.queryByLabelText("Xóa")).not.toBeInTheDocument();
  });
});
