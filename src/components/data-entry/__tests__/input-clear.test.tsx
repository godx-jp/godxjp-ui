import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Input } from "../input";

function ControlledInput({ onClear }: { onClear?: () => void }) {
  const [v, setV] = React.useState("hello");
  return (
    <Input
      aria-label="name"
      allowClear
      value={v}
      onChange={(e) => setV(e.target.value)}
      onClear={onClear}
    />
  );
}

describe("Input — allowClear", () => {
  it("clears a controlled value via the inline ✕ (onChange empties the field)", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    renderWithUi(<ControlledInput onClear={onClear} />);

    const input = screen.getByLabelText("name");
    expect(input).toHaveValue("hello");
    await user.click(screen.getByRole("button", { name: "Xóa" }));

    expect(input).toHaveValue("");
    expect(onClear).toHaveBeenCalledTimes(1);
    // the ✕ disappears once the field is empty
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
  });

  it("clears an uncontrolled value and empties the field", async () => {
    const user = userEvent.setup();
    renderWithUi(<Input aria-label="name" allowClear defaultValue="hello" />);

    const input = screen.getByLabelText("name");
    expect(input).toHaveValue("hello");
    await user.click(screen.getByRole("button", { name: "Xóa" }));
    expect(input).toHaveValue("");
  });

  it("shows no ✕ when empty, disabled, or allowClear is off", () => {
    const { rerender } = renderWithUi(<Input aria-label="a" allowClear value="" />);
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();

    rerender(<Input aria-label="a" allowClear value="x" disabled />);
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();

    rerender(<Input aria-label="a" value="x" />);
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
  });
});

describe("Input — trailingIcon (one trailing icon at a time)", () => {
  const Trigger = () => (
    <button type="button" aria-label="open">
      icon
    </button>
  );

  it("shows the trailingIcon when there is no clearable value, and the clear ✕ REPLACES it once a value is present", () => {
    const { rerender } = renderWithUi(
      <Input aria-label="a" allowClear trailingIcon={<Trigger />} value="" />,
    );
    // Empty + clearable → only the trailingIcon, no clear.
    expect(screen.getByRole("button", { name: "open" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();

    // Value present → the clear ✕ replaces the trailingIcon (never both).
    rerender(<Input aria-label="a" allowClear trailingIcon={<Trigger />} value="x" />);
    expect(screen.getByRole("button", { name: "Xóa" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "open" })).toBeNull();
  });

  it("keeps the trailingIcon (not a clear) when allowClear is off even with a value", () => {
    renderWithUi(<Input aria-label="a" trailingIcon={<Trigger />} value="x" />);
    expect(screen.getByRole("button", { name: "open" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
  });
});
