import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Radio } from "../radio";

describe("Radio.Group — composition (children) mode", () => {
  it("renders composed Radio.Items, honours defaultValue and fires onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Radio.Group defaultValue="b" onValueChange={onValueChange} aria-label="配送">
        <Radio.Item value="a" aria-label="A" />
        <Radio.Item value="b" aria-label="B" />
      </Radio.Group>,
    );
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "A" }));
    expect(onValueChange).toHaveBeenCalledWith("a");
  });

  it("reflects horizontal orientation on the group", () => {
    renderWithUi(
      <Radio.Group orientation="horizontal" aria-label="g">
        <Radio.Item value="x" aria-label="X" />
      </Radio.Group>,
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-orientation", "horizontal");
  });
});
