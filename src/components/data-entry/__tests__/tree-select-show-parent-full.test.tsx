import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { SHOW_PARENT, TreeSelect } from "../tree-select";

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

describe("TreeSelect — SHOW_PARENT with a fully-selected subtree", () => {
  it("drops a parent whose descendants are all selected, keeping the leaves", () => {
    render(
      <TreeSelect
        treeData={TREE}
        multiple
        treeCheckable
        showCheckedStrategy={SHOW_PARENT}
        defaultValue={["asia", "jp", "vn"]}
      />,
    );
    const trigger = screen.getByRole("combobox");
    // leaf nodes hit the `!node?.children?.length → true` keep branch
    expect(trigger).toHaveTextContent("日本");
    expect(trigger).toHaveTextContent("ベトナム");
    // the parent hits `!desc.every(...) === false` → dropped
    expect(trigger).not.toHaveTextContent("アジア");
  });
});
