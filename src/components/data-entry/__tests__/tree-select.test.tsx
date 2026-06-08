import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TreeSelect } from "../tree-select";
import { expectNoA11yViolations } from "@/test/a11y";

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

describe("TreeSelect", () => {
  it("shows the placeholder until a value is chosen", () => {
    render(<TreeSelect treeData={TREE} placeholder="地域を選択" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("地域を選択");
  });

  it("opens a tree popover with the root nodes", async () => {
    const user = userEvent.setup();
    render(<TreeSelect treeData={TREE} placeholder="地域" />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("tree")).toBeInTheDocument();
    expect(screen.getByText("アジア")).toBeInTheDocument();
    expect(screen.getByText("ヨーロッパ")).toBeInTheDocument();
  });

  it("expanding a parent reveals its children", async () => {
    const user = userEvent.setup();
    render(<TreeSelect treeData={TREE} placeholder="地域" />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByText("日本")).toBeNull();
    // the first button inside the tree is アジア's expand toggle (locale-agnostic)
    const tree = screen.getByRole("tree");
    await user.click(within(tree).getAllByRole("button")[0]);
    expect(screen.getByText("日本")).toBeInTheDocument();
  });

  it("single select: choosing a leaf fires onValueChange and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <TreeSelect
        treeData={TREE}
        treeDefaultExpandAll
        onValueChange={onValueChange}
        placeholder="地域"
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("button", { name: "日本" }));
    expect(onValueChange).toHaveBeenCalledWith("jp");
    expect(screen.queryByRole("tree")).toBeNull(); // closed
    expect(screen.getByRole("combobox")).toHaveTextContent("日本");
  });

  it("reflects a defaultValue label on the trigger", () => {
    render(<TreeSelect treeData={TREE} defaultValue="vn" placeholder="地域" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("ベトナム");
  });

  it("checkable: multiple leaves can be checked (stays open) → array value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <TreeSelect
        treeData={TREE}
        treeCheckable
        multiple
        treeDefaultExpandAll
        onValueChange={onValueChange}
        placeholder="地域"
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const tree = screen.getByRole("tree");
    await user.click(within(tree).getByText("日本"));
    await user.click(within(tree).getByText("ベトナム"));
    expect(onValueChange).toHaveBeenLastCalledWith(expect.arrayContaining(["jp", "vn"]));
    expect(screen.getByRole("tree")).toBeInTheDocument(); // still open
  });

  it("allowClear clears the selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <TreeSelect
        treeData={TREE}
        defaultValue="jp"
        allowClear
        onValueChange={onValueChange}
        placeholder="地域"
      />,
    );
    // the clear affordance is the non-combobox button on the trigger (locale-agnostic)
    const clearBtn = screen
      .getAllByRole("button")
      .find((b) => b.getAttribute("role") !== "combobox");
    await user.click(clearBtn!);
    expect(onValueChange).toHaveBeenCalled();
  });

  it("disabled trigger is not interactive", () => {
    render(<TreeSelect treeData={TREE} disabled placeholder="地域" />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("has no axe violations (labelled trigger)", async () => {
    await expectNoA11yViolations(
      <>
        <label htmlFor="ts-region">地域</label>
        <TreeSelect id="ts-region" treeData={TREE} treeDefaultExpandAll placeholder="地域" />
      </>,
    );
  });
});
