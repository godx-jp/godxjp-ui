import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Transfer } from "../transfer";

const DATA = [
  { key: "a", title: "AA" },
  { key: "b", title: "BB" },
  { key: "c", title: "CC", disabled: true },
];

describe("Transfer — target panel select-all", () => {
  it("select-all on the right panel selects every enabled target, enabling move-left", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Transfer dataSource={DATA} targetKeys={["a", "b", "c"]} onValueChange={onValueChange} />,
    );

    // the two header select-all checkboxes carry an aria-label; row checkboxes don't.
    // the left panel is empty → its select-all is disabled, so the enabled one is the right panel's.
    const selectAlls = screen.getAllByRole("checkbox").filter((c) => c.getAttribute("aria-label"));
    expect(selectAlls).toHaveLength(2);
    const rightSelectAll = selectAlls.find((c) => !(c as HTMLButtonElement).disabled)!;
    await user.click(rightSelectAll);

    // a + b are now selected on the right (c is disabled); the move-left control is the only
    // enabled non-checkbox button now
    const moveLeft = screen.getAllByRole("button").find((b) => !(b as HTMLButtonElement).disabled);
    await user.click(moveLeft!);

    // a + b moved back to the source; only the disabled c remains on the right
    expect(onValueChange).toHaveBeenCalledWith(["c"], "left", expect.arrayContaining(["a", "b"]));
  });
});
