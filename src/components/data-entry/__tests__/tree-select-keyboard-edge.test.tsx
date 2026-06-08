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
      { value: "vn", label: "ベトナム" },
    ],
  },
];

describe("TreeSelect — Arrow keys on a leaf are no-ops", () => {
  it("ArrowRight / ArrowLeft on a leaf node do nothing (no expand/collapse/move)", async () => {
    const user = userEvent.setup();
    render(<TreeSelect treeData={TREE} treeDefaultExpandAll placeholder="地域" />);
    await user.click(screen.getByRole("combobox"));
    const jp = screen.getByText("日本").closest('[role="treeitem"]')! as HTMLElement;

    jp.focus();
    await user.keyboard("{ArrowRight}"); // leaf, no children → neither expand nor step
    expect(jp).toHaveFocus();

    await user.keyboard("{ArrowLeft}"); // leaf, nothing to collapse
    expect(jp).toHaveFocus();
  });
});
