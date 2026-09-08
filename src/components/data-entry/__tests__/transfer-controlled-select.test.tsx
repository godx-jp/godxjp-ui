import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Transfer } from "../transfer";

const DATA = [
  { key: "a", title: "AA" },
  { key: "b", title: "BB" },
];

// The row is no longer a <label> around the box (nested labels); the row text names the box by
// reference instead, so the row IS the checkbox's accessible name.
const rowCheckbox = (title: string) => screen.getByRole("checkbox", { name: new RegExp(title) });

describe("Transfer — controlled selectedKeys", () => {
  it("checking a row emits onSelectChange (the controlled setSelected branch)", async () => {
    const user = userEvent.setup();
    const onSelectChange = vi.fn();
    renderWithUi(
      <Transfer
        dataSource={DATA}
        targetKeys={[]}
        selectedKeys={[[], []]}
        onSelectChange={onSelectChange}
        onValueChange={vi.fn()}
      />,
    );
    await user.click(rowCheckbox("AA"));
    // selectedKeysProp present → setSelected calls onSelectChange instead of setInternalSelected
    expect(onSelectChange).toHaveBeenCalledWith(["a"], []);
  });
});
