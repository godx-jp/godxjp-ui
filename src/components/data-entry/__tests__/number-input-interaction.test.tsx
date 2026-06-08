import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { NumberInput } from "../number-input";

/**
 * Behavioral interaction tests for NumberInput (WAI-ARIA spinbutton).
 * Codifies real keyboard/type/click behavior so future runs need NO browser MCP.
 *
 * The text field is role="spinbutton" carrying aria-valuenow/min/max. Value changes flow through
 * onValueChange(number | null). The stacked Buttons step by `step`; ArrowUp/ArrowDown step from the
 * keyboard (Shift = ×10). Value commits clamped to min/max and rounded to precision on blur/Enter.
 */
describe("NumberInput — interaction", () => {
  it("renders the spinbutton with the ARIA value range", () => {
    renderWithUi(<NumberInput defaultValue={5} min={0} max={10} aria-label="qty" />);
    const spin = screen.getByRole("spinbutton");
    expect(spin).toHaveAttribute("aria-valuenow", "5");
    expect(spin).toHaveAttribute("aria-valuemin", "0");
    expect(spin).toHaveAttribute("aria-valuemax", "10");
  });

  it("types a value and fires onValueChange with the parsed number", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput onValueChange={onValueChange} aria-label="qty" />);
    const spin = screen.getByRole("spinbutton");
    await user.click(spin);
    await user.type(spin, "42");
    expect(onValueChange).toHaveBeenLastCalledWith(42);
  });

  it("increment Button steps up by `step` and fires onValueChange (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <NumberInput defaultValue={10} step={5} onValueChange={onValueChange} aria-label="qty" />,
    );
    await user.click(screen.getByRole("button", { name: "Tăng" }));
    expect(onValueChange).toHaveBeenLastCalledWith(15);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-valuenow", "15");
  });

  it("decrement Button steps down by `step`", async () => {
    const user = userEvent.setup();
    renderWithUi(<NumberInput defaultValue={10} step={5} aria-label="qty" />);
    await user.click(screen.getByRole("button", { name: "Giảm" }));
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-valuenow", "5");
  });

  it("ArrowUp / ArrowDown step the value from the keyboard", async () => {
    const user = userEvent.setup();
    renderWithUi(<NumberInput defaultValue={3} step={1} aria-label="qty" />);
    const spin = screen.getByRole("spinbutton");
    spin.focus();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(spin).toHaveAttribute("aria-valuenow", "5");
    await user.keyboard("{ArrowDown}");
    expect(spin).toHaveAttribute("aria-valuenow", "4");
  });

  it("Shift + Arrow steps by ×10", async () => {
    const user = userEvent.setup();
    renderWithUi(<NumberInput defaultValue={0} step={1} aria-label="qty" />);
    const spin = screen.getByRole("spinbutton");
    spin.focus();
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(spin).toHaveAttribute("aria-valuenow", "10");
  });

  it("clamps to max on step and disables the increment Button at the ceiling", async () => {
    const user = userEvent.setup();
    renderWithUi(<NumberInput defaultValue={9} step={5} min={0} max={10} aria-label="qty" />);
    const spin = screen.getByRole("spinbutton");
    const up = screen.getByRole("button", { name: "Tăng" });
    await user.click(up);
    expect(spin).toHaveAttribute("aria-valuenow", "10");
    expect(up).toBeDisabled();
  });

  it("clamps to min on step and disables the decrement Button at the floor", async () => {
    const user = userEvent.setup();
    renderWithUi(<NumberInput defaultValue={2} step={5} min={0} max={10} aria-label="qty" />);
    const spin = screen.getByRole("spinbutton");
    const down = screen.getByRole("button", { name: "Giảm" });
    await user.click(down);
    expect(spin).toHaveAttribute("aria-valuenow", "0");
    expect(down).toBeDisabled();
  });

  it("clamps an out-of-range typed value to max on blur", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput min={0} max={100} onValueChange={onValueChange} aria-label="pct" />);
    const spin = screen.getByRole("spinbutton");
    await user.click(spin);
    await user.type(spin, "250");
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(100);
    expect(spin).toHaveAttribute("aria-valuenow", "100");
  });

  it("rounds to precision on commit", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <NumberInput precision={2} step={0.25} onValueChange={onValueChange} aria-label="kg" />,
    );
    const spin = screen.getByRole("spinbutton");
    await user.click(spin);
    await user.type(spin, "2.567");
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(2.57);
  });

  it("empties to null when cleared", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput defaultValue={5} onValueChange={onValueChange} aria-label="qty" />);
    const spin = screen.getByRole("spinbutton");
    await user.clear(spin);
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("controlled value sticks via onValueChange (freeze regression)", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = React.useState<number | null>(1);
      return <NumberInput value={v} onValueChange={setV} step={1} aria-label="qty" />;
    }
    renderWithUi(<Controlled />);
    const up = screen.getByRole("button", { name: "Tăng" });
    await user.click(up);
    await user.click(up);
    await user.click(up);
    // Without synchronous onValueChange wiring the value would be frozen at 1.
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-valuenow", "4");
  });

  it("disabled blocks stepping and is not editable", () => {
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput value={5} disabled onValueChange={onValueChange} aria-label="qty" />);
    const spin = screen.getByRole("spinbutton");
    expect(spin).toBeDisabled();
    expect(screen.getByRole("button", { name: "Tăng" })).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("readOnly shows the value but blocks typing and stepping", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput value={9} readOnly onValueChange={onValueChange} aria-label="qty" />);
    const spin = screen.getByRole("spinbutton");
    expect(spin).toHaveAttribute("readonly");
    expect(spin).toHaveAttribute("aria-valuenow", "9");
    spin.focus();
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(spin).toHaveAttribute("aria-valuenow", "9");
  });

  it("submits its value natively via name", () => {
    renderWithUi(<NumberInput name="quantity" defaultValue={7} aria-label="qty" />);
    const spin = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(spin).toHaveAttribute("name", "quantity");
    expect(spin.value).toBe("7");
  });
});
