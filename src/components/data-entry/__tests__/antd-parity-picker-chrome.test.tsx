import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent } from "@/test/render";

import { MonthPicker } from "../month-picker";
import { MonthRangePicker } from "../month-range-picker";

/**
 * THE PICKER-CHROME CONTRACT (`PickerChromeProp`) — open triad · status · variant · size ·
 * inputReadOnly · preserveInvalidOnBlur · placement · renderExtraFooter · ref.
 *
 * Every other picker composes it; the two month pickers had skipped it entirely, so two pickers in
 * one form row could not be given the same `size`, and a month field could not paint a validation
 * status while the date field beside it could. It is purely additive: nothing here changes what a
 * MonthPicker with no chrome props renders.
 */

function shell(container: HTMLElement) {
  return container.querySelector(".ui-control-composite-field") as HTMLElement;
}

describe("MonthPicker — chrome axes", () => {
  it("puts size / status / variant on the shared composite-field shell", () => {
    const { container } = renderWithUi(
      <MonthPicker aria-label="対象月" size="sm" status="warning" variant="filled" />,
    );
    expect(shell(container)).toHaveAttribute("data-size", "sm");
    expect(shell(container)).toHaveAttribute("data-status", "warning");
    expect(shell(container)).toHaveAttribute("data-variant", "filled");
  });

  it("status=error reaches assistive tech as aria-invalid ON THE INPUT (the focus target)", () => {
    renderWithUi(<MonthPicker aria-label="対象月" status="error" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });

  it("says nothing when given nothing — the resting DOM is unchanged", () => {
    const { container } = renderWithUi(<MonthPicker aria-label="対象月" />);
    expect(shell(container)).not.toHaveAttribute("data-size");
    expect(shell(container)).not.toHaveAttribute("data-status");
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid");
  });
});

describe("MonthPicker — the open triad", () => {
  it("defaultOpen opens the grid at rest", async () => {
    renderWithUi(<MonthPicker aria-label="対象月" defaultOpen />);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("a controlled `open` wins and onOpenChange still reports the attempt", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(<MonthPicker aria-label="対象月" open={false} onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("combobox"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // The parent said no, so the panel must not open behind its back.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("inputReadOnly makes the field untypeable and refuses to open", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<MonthPicker aria-label="対象月" inputReadOnly onValueChange={onValueChange} />);
    const field = screen.getByRole("combobox");
    expect(field).toHaveAttribute("readonly");
    await user.click(field);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("MonthPicker — preserveInvalidOnBlur + allowClear object form", () => {
  // The entry is applied atomically: typing it a character at a time would let an INTERMEDIATE
  // prefix ("2026/1") parse and commit, which is a different behaviour from the one under test.
  it("by default an UNPARSEABLE month reverts on blur", () => {
    renderWithUi(<MonthPicker aria-label="対象月" defaultValue={new Date(2026, 4, 1)} />);
    const field = screen.getByRole("combobox") as HTMLInputElement;
    // 13 is not a month — `parseYm` rejects it, so nothing was ever committed.
    fireEvent.change(field, { target: { value: "2026/13" } });
    fireEvent.blur(field);
    expect(field).toHaveValue("2026/05");
  });

  it("preserveInvalidOnBlur keeps the rejected text so it can be corrected", () => {
    renderWithUi(
      <MonthPicker aria-label="対象月" defaultValue={new Date(2026, 4, 1)} preserveInvalidOnBlur />,
    );
    const field = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "2026/13" } });
    fireEvent.blur(field);
    expect(field).toHaveValue("2026/13");
  });

  it("the allowClear OBJECT form overrides the clear button's accessible label", () => {
    renderWithUi(
      <MonthPicker
        aria-label="対象月"
        defaultValue={new Date(2026, 4, 1)}
        allowClear={{ label: "Reset month" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Reset month" })).toBeInTheDocument();
  });

  it("allowClear={false} still withdraws the ✕", () => {
    renderWithUi(
      <MonthPicker aria-label="対象月" defaultValue={new Date(2026, 4, 1)} allowClear={false} />,
    );
    expect(screen.queryByRole("button", { name: "Xóa" })).not.toBeInTheDocument();
  });

  it("renderExtraFooter lands under the month grid", async () => {
    renderWithUi(
      <MonthPicker
        aria-label="対象月"
        defaultOpen
        renderExtraFooter={() => <span data-testid="footer">会計年度</span>}
      />,
    );
    expect(await screen.findByTestId("footer")).toBeInTheDocument();
  });
});

describe("MonthRangePicker — the same contract", () => {
  it("carries size / status / variant on the shell", () => {
    const { container } = renderWithUi(
      <MonthRangePicker aria-label="期間" size="lg" status="error" variant="borderless" />,
    );
    expect(shell(container)).toHaveAttribute("data-size", "lg");
    expect(shell(container)).toHaveAttribute("data-status", "error");
    expect(shell(container)).toHaveAttribute("data-variant", "borderless");
  });

  it("defaultOpen + renderExtraFooter", async () => {
    renderWithUi(
      <MonthRangePicker
        aria-label="期間"
        defaultOpen
        renderExtraFooter={() => <span data-testid="range-footer">今期</span>}
      />,
    );
    expect(await screen.findByTestId("range-footer")).toBeInTheDocument();
  });

  it("inputReadOnly locks both edges and withdraws the ✕", () => {
    renderWithUi(
      <MonthRangePicker
        aria-label="期間"
        defaultValue={{ from: new Date(2026, 0, 1), to: new Date(2026, 2, 1) }}
        inputReadOnly
      />,
    );
    for (const field of screen.getAllByRole("textbox")) {
      expect(field).toHaveAttribute("readonly");
    }
    expect(screen.queryByRole("button", { name: "Xóa" })).not.toBeInTheDocument();
  });
});
