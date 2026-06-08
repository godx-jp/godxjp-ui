import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Transfer } from "../transfer";

const DATA = [
  { key: "a", title: "AA" },
  { key: "b", title: "BB" },
];

// the enabled header select-all (left panel is empty here → its select-all is disabled)
const targetSelectAll = () =>
  screen
    .getAllByRole("checkbox")
    .filter((c) => c.getAttribute("aria-label"))
    .find((c) => !(c as HTMLButtonElement).disabled)!;

describe("Transfer — target panel select-all toggle off", () => {
  it("checking then unchecking the target select-all clears the target selection", async () => {
    const user = userEvent.setup();
    renderWithUi(<Transfer dataSource={DATA} targetKeys={["a", "b"]} onValueChange={vi.fn()} />);

    await user.click(targetSelectAll()); // check all target → a,b selected
    const rows = screen.getAllByRole("checkbox").filter((c) => !c.getAttribute("aria-label"));
    expect(rows.every((r) => r.getAttribute("aria-checked") === "true")).toBe(true);

    await user.click(targetSelectAll()); // uncheck → onSelectAll(false) on side 1 → setSelected(1, [])
    const rowsAfter = screen.getAllByRole("checkbox").filter((c) => !c.getAttribute("aria-label"));
    expect(rowsAfter.every((r) => r.getAttribute("aria-checked") !== "true")).toBe(true);
  });
});
