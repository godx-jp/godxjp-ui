import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Transfer } from "../transfer";

const DATA = [
  { key: "a", title: "AA" },
  { key: "b", title: "BB" },
];

const rowCheckbox = (title: string) =>
  screen.getAllByRole("checkbox").find((c) => c.closest("label")?.textContent?.includes(title))!;

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
