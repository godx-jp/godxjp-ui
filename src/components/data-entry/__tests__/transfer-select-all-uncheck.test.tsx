import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Transfer } from "../transfer";

const DATA = [
  { key: "a", title: "AA" },
  { key: "b", title: "BB" },
];

const sourceSelectAll = () =>
  screen
    .getAllByRole("checkbox")
    .filter((c) => c.getAttribute("aria-label"))
    .find((c) => !(c as HTMLButtonElement).disabled)!;

describe("Transfer — source select-all toggle off", () => {
  it("checking then unchecking select-all clears the source selection", async () => {
    const user = userEvent.setup();
    renderWithUi(<Transfer dataSource={DATA} targetKeys={[]} onValueChange={vi.fn()} />);

    await user.click(sourceSelectAll()); // check all → a,b selected
    const rows = screen.getAllByRole("checkbox").filter((c) => !c.getAttribute("aria-label"));
    expect(rows.every((r) => r.getAttribute("aria-checked") === "true")).toBe(true);

    await user.click(sourceSelectAll()); // uncheck → onSelectAll(false) → setSelected(0, [])
    const rowsAfter = screen.getAllByRole("checkbox").filter((c) => !c.getAttribute("aria-label"));
    expect(rowsAfter.every((r) => r.getAttribute("aria-checked") !== "true")).toBe(true);
  });
});
