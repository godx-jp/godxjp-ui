import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { TreeSelect } from "../tree-select";

const TREE = [{ value: "asia", label: "アジア", children: [{ value: "jp", label: "日本" }] }];

describe("TreeSelect — value not present in the tree", () => {
  it("shows the raw value when no matching node/label is found", () => {
    render(<TreeSelect treeData={TREE} multiple treeCheckable defaultValue={["未知のコード"]} />);
    // displayLabel: findNodeByValue(...) is undefined → no label → falls back to the raw value
    expect(screen.getByRole("combobox")).toHaveTextContent("未知のコード");
  });
});
