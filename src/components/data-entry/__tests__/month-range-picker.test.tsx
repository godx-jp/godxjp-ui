import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker } from "../date-picker";

/**
 * `<DatePicker range picker="month" />` — the control that used to be a separate
 * `MonthRangePicker`. Same contract; the field now reads and accepts ISO `yyyy-MM`, the bounds are
 * `minDate`/`maxDate`, and the ISO value reaches the form through a hidden `${name}_from`/`_to`
 * pair rather than through the display text.
 */
describe("DatePicker range picker=month", () => {
  it("renders both edges as ISO yyyy-MM in ONE control and always carries ids", () => {
    render(
      <DatePicker
        range
        picker="month"
        value={{ from: new Date(2026, 0, 1), to: new Date(2026, 5, 1) }}
        onValueChange={() => {}}
      />,
    );
    const [from, to] = screen.getAllByRole("textbox");
    expect(from).toHaveValue("2026-01");
    expect(to).toHaveValue("2026-06");
    expect(from).toHaveAttribute("id");
    expect(to).toHaveAttribute("id");
    // One shared shell: both inputs live inside the same bordered container.
    expect(from.parentElement).toBe(to.parentElement);
  });

  it("submits ${name}_from / ${name}_to as ISO yyyy-MM", () => {
    const { container } = render(
      <form>
        <DatePicker
          range
          picker="month"
          name="search_negotiation_ym"
          value={{ from: new Date(2026, 0, 1), to: new Date(2026, 5, 1) }}
          onValueChange={() => {}}
        />
      </form>,
    );
    const data = new FormData(container.querySelector("form") as HTMLFormElement);
    expect(data.get("search_negotiation_ym_from")).toBe("2026-01");
    expect(data.get("search_negotiation_ym_to")).toBe("2026-06");
  });

  it("commits a complete typed yyyy-MM on either edge", () => {
    const onValueChange = vi.fn();
    render(<DatePicker range picker="month" onValueChange={onValueChange} />);
    const [from, to] = screen.getAllByPlaceholderText("Chọn tháng");
    fireEvent.change(from, { target: { value: "2025-11" } });
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2025, 10, 1), to: undefined });
    fireEvent.change(to, { target: { value: "2026-02" } });
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2025, 10, 1),
      to: new Date(2026, 1, 1),
    });
  });

  it("normalizes a backwards typed range (from > to swaps — never emits an inverted range)", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker
        range
        picker="month"
        defaultValue={{ from: new Date(2026, 5, 1), to: undefined }}
        onValueChange={onValueChange}
      />,
    );
    const [, to] = screen.getAllByPlaceholderText("Chọn tháng");
    fireEvent.change(to, { target: { value: "2026-01" } });
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 0, 1),
      to: new Date(2026, 5, 1),
    });
  });

  it("ignores partial input (no mid-type mangling) and clears on empty", () => {
    const onValueChange = vi.fn();
    render(<DatePicker range picker="month" onValueChange={onValueChange} />);
    const [from] = screen.getAllByPlaceholderText("Chọn tháng");
    fireEvent.change(from, { target: { value: "2025-13" } });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(from).toHaveValue("2025-13");
    fireEvent.change(from, { target: { value: "2025-03" } });
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2025, 2, 1), to: undefined });
    fireEvent.change(from, { target: { value: "" } });
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it("two-step grid pick: from then to, closing the popover on completion", () => {
    const onValueChange = vi.fn();
    render(<DatePicker range picker="month" onValueChange={onValueChange} />);
    fireEvent.click(screen.getAllByRole("textbox")[0]);
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
      <DatePicker
        range
        picker="month"
        defaultValue={{ from: new Date(2026, 8, 1), to: undefined }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getAllByRole("textbox")[0]);
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
      <DatePicker
        range
        picker="month"
        defaultValue={{ from: new Date(2026, 2, 1), to: new Date(2026, 8, 1) }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getAllByRole("textbox")[0]);
    const cells = screen.getByRole("grid").querySelectorAll("button");
    fireEvent.click(cells[10]); // November — must START a new range, not extend
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 1),
      to: undefined,
    });
  });

  it("value-at-rest: the grid opens on the held range's year", () => {
    render(
      <DatePicker
        range
        picker="month"
        value={{ from: new Date(2023, 3, 1), to: new Date(2023, 7, 1) }}
        onValueChange={() => {}}
      />,
    );
    fireEvent.click(screen.getAllByRole("textbox")[0]);
    expect(screen.getByText("2023")).toBeInTheDocument();
  });

  it("clamps the grid to minDate/maxDate", () => {
    render(
      <DatePicker
        range
        picker="month"
        value={{ from: new Date(2026, 0, 1), to: undefined }}
        onValueChange={() => {}}
        minDate={new Date(2026, 0, 1)}
        maxDate={new Date(2026, 11, 31)}
      />,
    );
    fireEvent.click(screen.getAllByRole("textbox")[0]);
    expect(screen.getByLabelText("Năm trước")).toBeDisabled();
    expect(screen.getByLabelText("Năm sau")).toBeDisabled();
  });

  it("clears the whole range via the inline x", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker
        range
        picker="month"
        value={{ from: new Date(2026, 0, 1), to: new Date(2026, 5, 1) }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Xóa"));
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });

  it("disabled blocks typing, the grid trigger and hides clear", () => {
    render(
      <DatePicker
        range
        picker="month"
        value={{ from: new Date(2026, 0, 1), to: new Date(2026, 5, 1) }}
        onValueChange={() => {}}
        disabled
      />,
    );
    expect(screen.getAllByRole("textbox")[0]).toBeDisabled();
    expect(screen.getByLabelText("Mở chọn tháng")).toBeDisabled();
    expect(screen.queryByLabelText("Xóa")).not.toBeInTheDocument();
  });
});
