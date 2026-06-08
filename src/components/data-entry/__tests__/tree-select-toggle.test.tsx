import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TreeSelect } from "../tree-select";

const TREE = [
  {
    value: "asia",
    label: "アジア",
    children: [
      { value: "jp", label: "日本" },
      { value: "vn", label: "ベトナム" },
    ],
  },
];

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("combobox"));
}

describe("TreeSelect — toggle selection", () => {
  it("treeCheckStrictly: Enter selects then de-selects exactly that node", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <TreeSelect
        treeData={TREE}
        multiple
        treeCheckable
        treeCheckStrictly
        treeDefaultExpandAll
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    const jp = screen.getAllByRole("treeitem")[1]; // [asia, jp, vn]
    jp.focus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["jp"]);
    await user.keyboard("{Enter}"); // toggle off (strict: filter just this key)
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("non-strict: toggling a parent adds then removes its whole subtree", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <TreeSelect
        treeData={TREE}
        multiple
        treeCheckable
        treeDefaultExpandAll
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    const asia = screen.getAllByRole("treeitem")[0];
    asia.focus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(expect.arrayContaining(["asia", "jp", "vn"]));
    await user.keyboard("{Enter}"); // toggle off → removes the related subtree
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("an unhandled key on a treeitem is a no-op", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TreeSelect treeData={TREE} multiple treeCheckable onValueChange={onValueChange} />);
    await open(user);
    const asia = screen.getAllByRole("treeitem")[0];
    asia.focus();
    await user.keyboard("a"); // default branch → nothing happens
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
