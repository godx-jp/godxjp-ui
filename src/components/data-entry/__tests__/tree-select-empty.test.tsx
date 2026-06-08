import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TreeSelect } from "../tree-select";

const TREE = [
  {
    value: "asia",
    label: "アジア",
    children: [
      { value: "jp", label: "日本" },
      { value: "vn", label: "ベトナム", disabled: true },
    ],
  },
];

describe("TreeSelect — empty search + disabled node", () => {
  it("shows the empty state when there are no tree nodes", async () => {
    const user = userEvent.setup();
    render(<TreeSelect treeData={[]} placeholder="地域" />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryAllByRole("treeitem")).toHaveLength(0); // visible.length === 0 branch
    // the empty placeholder paragraph renders inside the (portaled) tree
    expect(screen.getByRole("tree").querySelector("p")).not.toBeNull();
  });

  it("a disabled node is not in the tab order (tabIndex -1)", async () => {
    const user = userEvent.setup();
    render(<TreeSelect treeData={TREE} treeDefaultExpandAll placeholder="地域" />);
    await user.click(screen.getByRole("combobox"));
    const vn = screen.getByText("ベトナム").closest('[role="treeitem"]')!;
    expect(vn).toHaveAttribute("tabindex", "-1");
  });
});
