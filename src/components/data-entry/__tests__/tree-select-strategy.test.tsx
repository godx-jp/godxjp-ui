import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { SHOW_ALL, SHOW_PARENT, TreeSelect } from "../tree-select";

const TREE = [
  {
    value: "asia",
    label: "アジア",
    children: [
      { value: "jp", label: "日本" },
      { value: "vn", label: "ベトナム" },
    ],
  },
  { value: "eu", label: "ヨーロッパ", children: [{ value: "fr", label: "フランス" }] },
];

const trigger = () => screen.getByRole("combobox");

describe("TreeSelect — showCheckedStrategy display", () => {
  it("SHOW_CHILD (default) hides a fully-selected parent, showing only leaves", () => {
    render(
      <TreeSelect treeData={TREE} multiple treeCheckable defaultValue={["asia", "jp", "vn"]} />,
    );
    expect(trigger()).toHaveTextContent("日本");
    expect(trigger()).toHaveTextContent("ベトナム");
    expect(trigger()).not.toHaveTextContent("アジア");
  });

  it("SHOW_ALL keeps every selected value in the label", () => {
    render(
      <TreeSelect
        treeData={TREE}
        multiple
        treeCheckable
        showCheckedStrategy={SHOW_ALL}
        defaultValue={["asia", "jp", "vn"]}
      />,
    );
    expect(trigger()).toHaveTextContent("アジア");
    expect(trigger()).toHaveTextContent("日本");
    expect(trigger()).toHaveTextContent("ベトナム");
  });

  it("SHOW_PARENT keeps a lone parent value", () => {
    render(
      <TreeSelect
        treeData={TREE}
        multiple
        treeCheckable
        showCheckedStrategy={SHOW_PARENT}
        defaultValue={["asia"]}
      />,
    );
    expect(trigger()).toHaveTextContent("アジア");
  });

  it("treeCheckStrictly shows exactly the selected values (no parent/child folding)", () => {
    render(
      <TreeSelect
        treeData={TREE}
        multiple
        treeCheckable
        treeCheckStrictly
        defaultValue={["asia", "jp"]}
      />,
    );
    expect(trigger()).toHaveTextContent("アジア");
    expect(trigger()).toHaveTextContent("日本");
  });

  it("falls back to the placeholder when nothing is selected", () => {
    render(<TreeSelect treeData={TREE} multiple treeCheckable placeholder="選択してください" />);
    expect(trigger()).toHaveTextContent("選択してください");
  });
});
