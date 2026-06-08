import type { ReactElement } from "react";
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
  {
    value: "eu",
    label: "ヨーロッパ",
    children: [{ value: "fr", label: "フランス" }],
  },
];

/** Open the popover and return the live list of treeitems. */
async function openTree(user: ReturnType<typeof userEvent.setup>, ui: ReactElement) {
  render(ui);
  await user.click(screen.getByRole("combobox"));
  return screen.getByRole("tree");
}

describe("TreeSelect — keyboard navigation (WAI-ARIA tree)", () => {
  it("ArrowRight expands a collapsed parent", async () => {
    const user = userEvent.setup();
    await openTree(user, <TreeSelect treeData={TREE} multiple treeCheckable />);
    expect(screen.queryByText("日本")).toBeNull();
    const asia = screen.getAllByRole("treeitem")[0];
    asia.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("日本")).toBeInTheDocument();
  });

  it("ArrowLeft collapses an expanded parent", async () => {
    const user = userEvent.setup();
    await openTree(
      user,
      <TreeSelect treeData={TREE} multiple treeCheckable treeDefaultExpandAll />,
    );
    expect(screen.getByText("日本")).toBeInTheDocument();
    const asia = screen.getAllByRole("treeitem")[0];
    asia.focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.queryByText("日本")).toBeNull();
  });

  it("ArrowDown moves the roving focus to the next visible node", async () => {
    const user = userEvent.setup();
    await openTree(user, <TreeSelect treeData={TREE} multiple treeCheckable />);
    const [asia, eu] = screen.getAllByRole("treeitem");
    asia.focus();
    await user.keyboard("{ArrowDown}");
    expect(eu).toHaveFocus();
  });

  it("ArrowRight on an already-expanded parent steps into its first child", async () => {
    const user = userEvent.setup();
    await openTree(
      user,
      <TreeSelect treeData={TREE} multiple treeCheckable treeDefaultExpandAll />,
    );
    const items = screen.getAllByRole("treeitem");
    const asia = items[0];
    const jp = items[1]; // 日本 — first child of アジア
    asia.focus();
    await user.keyboard("{ArrowRight}");
    expect(jp).toHaveFocus();
  });

  it("ArrowUp at the top edge is a no-op (stays put)", async () => {
    const user = userEvent.setup();
    await openTree(user, <TreeSelect treeData={TREE} multiple treeCheckable />);
    const asia = screen.getAllByRole("treeitem")[0];
    asia.focus();
    await user.keyboard("{ArrowUp}");
    expect(asia).toHaveFocus();
  });

  it("Enter toggles checkable selection on the focused node", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    await openTree(
      user,
      <TreeSelect
        treeData={TREE}
        multiple
        treeCheckable
        treeDefaultExpandAll
        onValueChange={onValueChange}
      />,
    );
    const jp = screen.getAllByRole("treeitem")[1];
    jp.focus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(expect.arrayContaining(["jp"]));
  });

  it("Space selects a leaf in single-select mode and closes the popover", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    await openTree(
      user,
      <TreeSelect treeData={TREE} treeDefaultExpandAll onValueChange={onValueChange} />,
    );
    const jp = screen.getAllByRole("treeitem")[1];
    jp.focus();
    await user.keyboard("[Space]");
    expect(onValueChange).toHaveBeenLastCalledWith("jp");
    expect(screen.queryByRole("tree")).toBeNull(); // single-select closes
  });
});

describe("TreeSelect — clear", () => {
  it("the clear affordance resets the value to empty", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <TreeSelect
        treeData={TREE}
        multiple
        treeCheckable
        defaultValue={["jp"]}
        allowClear
        onValueChange={onValueChange}
      />,
    );
    // before opening, the only role=button in the trigger is the clear (combobox has role=combobox)
    const clearBtn = screen.getByRole("button");
    await user.click(clearBtn);
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });
});
