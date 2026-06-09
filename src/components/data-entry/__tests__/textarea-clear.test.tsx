import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Textarea } from "../textarea";

function ControlledTextarea({ onClear }: { onClear?: () => void }) {
  const [v, setV] = React.useState("note");
  return (
    <Textarea
      aria-label="note"
      allowClear
      value={v}
      onChange={(e) => setV(e.target.value)}
      onClear={onClear}
    />
  );
}

describe("Textarea — allowClear", () => {
  it("clears a controlled value via the inline ✕", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    renderWithUi(<ControlledTextarea onClear={onClear} />);

    const area = screen.getByLabelText("note");
    expect(area).toHaveValue("note");
    await user.click(screen.getByRole("button", { name: "Xóa" }));

    expect(area).toHaveValue("");
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("clears an uncontrolled value", async () => {
    const user = userEvent.setup();
    renderWithUi(<Textarea aria-label="note" allowClear defaultValue="note" />);
    await user.click(screen.getByRole("button", { name: "Xóa" }));
    expect(screen.getByLabelText("note")).toHaveValue("");
  });

  it("shows no ✕ when empty or allowClear is off", () => {
    const { rerender } = renderWithUi(<Textarea aria-label="a" allowClear value="" />);
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
    rerender(<Textarea aria-label="a" value="x" />);
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
  });
});
