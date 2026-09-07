import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen } from "@/test/render";

import { NumberInput } from "../number-input";

/** antd's InputNumber knobs: formatter / parser / keyboard / controls / changeOnWheel. */
describe("NumberInput — formatter / parser", () => {
  it("formatter replaces the localized display of the value AT REST", () => {
    renderWithUi(
      <NumberInput
        aria-label="金額"
        defaultValue={1234}
        formatter={(n) => (n == null ? "" : `¥ ${n}`)}
      />,
    );
    expect(screen.getByRole("spinbutton")).toHaveValue("¥ 1234");
  });

  it("parser reads the formatted text back, so the pair round-trips", () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <NumberInput
        aria-label="金額"
        formatter={(n) => (n == null ? "" : `¥ ${n}`)}
        parser={(text) => {
          const digits = text.replace(/[^\d.-]/g, "");
          return digits === "" ? null : Number(digits);
        }}
        onValueChange={onValueChange}
      />,
    );
    const field = screen.getByRole("spinbutton");
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "¥ 980" } });
    fireEvent.blur(field);
    expect(onValueChange).toHaveBeenLastCalledWith(980);
    expect(field).toHaveValue("¥ 980");
  });
});

describe("NumberInput — keyboard", () => {
  it("steps on ArrowUp/ArrowDown by default", () => {
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput aria-label="数量" defaultValue={3} onValueChange={onValueChange} />);
    const field = screen.getByRole("spinbutton");
    fireEvent.keyDown(field, { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });

  it("keyboard={false} stops the arrows from stepping — and the buttons still work", () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <NumberInput
        aria-label="数量"
        defaultValue={3}
        keyboard={false}
        onValueChange={onValueChange}
      />,
    );
    const field = screen.getByRole("spinbutton");
    fireEvent.keyDown(field, { key: "ArrowUp" });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /tăng|increment/i }));
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });
});

describe("NumberInput — controls", () => {
  it("draws the two steppers by default", () => {
    const { container } = renderWithUi(<NumberInput aria-label="数量" />);
    expect(container.querySelector('[data-slot="number-input-steppers"]')).toBeTruthy();
  });

  it("controls={false} drops the buttons but KEEPS the spinbutton role and the arrows", () => {
    const onValueChange = vi.fn();
    const { container } = renderWithUi(
      <NumberInput
        aria-label="数量"
        defaultValue={3}
        controls={false}
        onValueChange={onValueChange}
      />,
    );
    expect(container.querySelector('[data-slot="number-input-steppers"]')).toBeNull();
    const field = screen.getByRole("spinbutton");
    fireEvent.keyDown(field, { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    expect(container.querySelector('[data-slot="number-input"]')).toHaveAttribute(
      "data-controls",
      "off",
    );
  });
});

describe("NumberInput — changeOnWheel", () => {
  it("ignores the wheel by default, so scrolling past a form cannot edit it", () => {
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput aria-label="数量" defaultValue={3} onValueChange={onValueChange} />);
    const field = screen.getByRole("spinbutton");
    fireEvent.focus(field);
    fireEvent.wheel(field, { deltaY: -100 });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("steps on the wheel when asked — but ONLY while the field is focused", () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <NumberInput
        aria-label="数量"
        defaultValue={3}
        changeOnWheel
        onValueChange={onValueChange}
      />,
    );
    const field = screen.getByRole("spinbutton");

    // Hovering an unfocused field and scrolling the page must not touch the value.
    fireEvent.wheel(field, { deltaY: -100 });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.focus(field);
    fireEvent.wheel(field, { deltaY: -100 });
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    fireEvent.wheel(field, { deltaY: 100 });
    expect(onValueChange).toHaveBeenLastCalledWith(3);
  });
});
