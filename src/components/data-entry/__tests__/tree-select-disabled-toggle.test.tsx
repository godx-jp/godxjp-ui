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
      { value: "vn", label: "ベトナム", disabled: true },
    ],
  },
];

describe("TreeSelect — toggling a disabled node", () => {
  it("Enter on a disabled node does not select it", async () => {
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
    await user.click(screen.getByRole("combobox"));
    const vn = screen.getByText("ベトナム").closest('[role="treeitem"]')! as HTMLElement;
    vn.focus();
    await user.keyboard("{Enter}"); // toggleSelect bails on node.disabled
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
