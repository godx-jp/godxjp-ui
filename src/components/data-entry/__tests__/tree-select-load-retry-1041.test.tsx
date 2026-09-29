/**
 * gh#1041 — TreeSelect had the same never-cleared `requestedLoads` ledger as Tree. antd's
 * TreeSelect renders rc-tree, so the port is rc-tree's: a rejected `loadData` folds the branch
 * shut, is not marked loaded, and the next expand asks again.
 */
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";

import { TreeSelect } from "../tree-select";

describe("TreeSelect — a rejected loadData can be retried (gh#1041)", () => {
  it("re-asks on the next expand after a rejection, and never after a success", async () => {
    const user = userEvent.setup();
    const loadData = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue(undefined);
    renderWithUi(
      <TreeSelect
        treeData={[{ value: "suite", label: "Suite", isLeaf: false }]}
        aria-label="Suites"
        defaultOpen
        loadData={loadData}
      />,
    );
    const row = () => screen.getByRole("treeitem");
    await user.click(within(row()).getByRole("button", { name: "Mở rộng" }));
    expect(loadData).toHaveBeenCalledTimes(1);
    // rc-tree restores the expanded keys without the failed node.
    await waitFor(() => expect(row()).toHaveAttribute("aria-expanded", "false"));

    await user.click(within(row()).getByRole("button", { name: "Mở rộng" }));
    expect(loadData, "the retry must reach loadData").toHaveBeenCalledTimes(2);

    await user.click(within(row()).getByRole("button", { name: "Thu gọn" }));
    await user.click(within(row()).getByRole("button", { name: "Mở rộng" }));
    expect(loadData).toHaveBeenCalledTimes(2);
  });
});
