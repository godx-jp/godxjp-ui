import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";

import { Tree } from "../tree";
import type { TreeNodeProp } from "../tree";

const PERMISSIONS: TreeNodeProp[] = [
  {
    value: "billing",
    label: "請求管理",
    children: [
      { value: "billing.read", label: "閲覧" },
      { value: "billing.write", label: "発行" },
    ],
  },
  {
    value: "people",
    label: "人事",
    children: [
      { value: "people.read", label: "プロフィール閲覧" },
      { value: "people.approve", label: "承認", disabled: true },
      { value: "people.refund", label: "返金", disableCheckbox: true },
    ],
  },
];

const item = (name: string) => screen.getByRole("treeitem", { name });
const box = (name: string) => item(name).querySelector(".ui-tree-check") as HTMLElement;
const glyphState = (name: string) =>
  item(name).querySelector('[data-slot="checkbox"]')?.getAttribute("data-state");

function Host(props: Partial<React.ComponentProps<typeof Tree>>) {
  const [checkedValues, setCheckedValues] = React.useState<string[]>([]);
  return (
    <Tree
      aria-label="権限"
      treeData={PERMISSIONS}
      checkable
      defaultExpandAll
      checkedValues={checkedValues}
      onCheckedValuesChange={setCheckedValues}
      {...props}
    />
  );
}

describe("Tree checkable — tri-state parent", () => {
  it("starts every node unchecked, with the box drawn but not focusable", () => {
    render(<Host />);
    for (const name of ["請求管理", "閲覧", "発行"]) {
      expect(item(name)).toHaveAttribute("aria-checked", "false");
      expect(glyphState(name)).toBe("unchecked");
    }
    // The tick box is a DECORATIVE glyph — a tree item owns exactly one tab stop.
    expect(screen.getByRole("tree").querySelectorAll("input")).toHaveLength(0);
    expect(screen.getByRole("tree").querySelectorAll("button")).toHaveLength(0);
  });

  it("checking a parent cascades to every descendant", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(box("請求管理"));
    expect(item("請求管理")).toHaveAttribute("aria-checked", "true");
    expect(item("閲覧")).toHaveAttribute("aria-checked", "true");
    expect(item("発行")).toHaveAttribute("aria-checked", "true");
  });

  it("a PARTIAL selection makes the parent indeterminate — never 'all checked'", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(box("閲覧"));

    expect(item("請求管理")).toHaveAttribute("aria-checked", "mixed");
    expect(glyphState("請求管理")).toBe("indeterminate");
    expect(item("発行")).toHaveAttribute("aria-checked", "false");
  });

  it("unticking ONE child of a fully checked parent drops the parent to mixed", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(box("請求管理"));
    expect(item("請求管理")).toHaveAttribute("aria-checked", "true");

    await user.click(box("閲覧"));
    // The affordance must tell the truth: the parent is no longer complete.
    expect(item("請求管理")).toHaveAttribute("aria-checked", "mixed");
    expect(glyphState("請求管理")).toBe("indeterminate");
  });

  it("completing the last child promotes the parent back to checked", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(box("閲覧"));
    await user.click(box("発行"));
    expect(item("請求管理")).toHaveAttribute("aria-checked", "true");
  });

  it("unchecking a parent clears the whole branch", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(box("請求管理"));
    await user.click(box("請求管理"));
    expect(item("請求管理")).toHaveAttribute("aria-checked", "false");
    expect(item("閲覧")).toHaveAttribute("aria-checked", "false");
    expect(item("発行")).toHaveAttribute("aria-checked", "false");
  });

  it("locked children stay out of the parent's denominator", async () => {
    const user = userEvent.setup();
    render(<Host />);
    // "承認" is disabled and "返金" is disableCheckbox — neither can ever be ticked, so ticking
    // the ONE node that can must be enough to complete the parent.
    await user.click(box("プロフィール閲覧"));
    expect(item("人事")).toHaveAttribute("aria-checked", "true");
    expect(item("承認")).toHaveAttribute("aria-checked", "false");
    expect(item("返金")).toHaveAttribute("aria-checked", "false");
  });

  it("a disableCheckbox node refuses the tick but the ROW still selects", async () => {
    const user = userEvent.setup();
    const onCheckedValuesChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Tree
        aria-label="権限"
        treeData={PERMISSIONS}
        checkable
        defaultExpandAll
        onCheckedValuesChange={onCheckedValuesChange}
        onValueChange={onValueChange}
      />,
    );
    await user.click(box("返金"));
    expect(onCheckedValuesChange).not.toHaveBeenCalled();

    await user.click(item("返金"));
    expect(onValueChange).toHaveBeenCalledWith("people.refund");
  });

  it("clicking the box checks WITHOUT selecting the row", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Host onValueChange={onValueChange} />);
    await user.click(box("閲覧"));
    expect(item("閲覧")).toHaveAttribute("aria-checked", "true");
    expect(item("閲覧")).toHaveAttribute("aria-selected", "false");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("Tree checkable — the emitted value", () => {
  it("reports a branch only when every tickable child is in", async () => {
    const user = userEvent.setup();
    const onCheckedValuesChange = vi.fn();
    render(<Host onCheckedValuesChange={onCheckedValuesChange} checkedValues={undefined} />);

    await user.click(box("閲覧"));
    expect(onCheckedValuesChange).toHaveBeenLastCalledWith(["billing.read"]);

    await user.click(box("発行"));
    expect(onCheckedValuesChange).toHaveBeenLastCalledWith([
      "billing.read",
      "billing.write",
      "billing",
    ]);

    // Take one back out: the branch must LEAVE the array, not linger as a false claim.
    await user.click(box("閲覧"));
    expect(onCheckedValuesChange).toHaveBeenLastCalledWith(["billing.write"]);
  });

  it("honours defaultCheckedValues when uncontrolled", () => {
    render(
      <Tree
        aria-label="権限"
        treeData={PERMISSIONS}
        checkable
        defaultExpandAll
        defaultCheckedValues={["billing.read"]}
      />,
    );
    expect(item("閲覧")).toHaveAttribute("aria-checked", "true");
    expect(item("請求管理")).toHaveAttribute("aria-checked", "mixed");
  });

  it("a controlled tree that ignores the change does not move", async () => {
    const user = userEvent.setup();
    const onCheckedValuesChange = vi.fn();
    render(
      <Tree
        aria-label="権限"
        treeData={PERMISSIONS}
        checkable
        defaultExpandAll
        checkedValues={[]}
        onCheckedValuesChange={onCheckedValuesChange}
      />,
    );
    await user.click(box("閲覧"));
    expect(onCheckedValuesChange).toHaveBeenCalledWith(["billing.read"]);
    expect(item("閲覧")).toHaveAttribute("aria-checked", "false");
  });
});

describe("Tree checkable — checkStrictly", () => {
  it("does not cascade and never shows mixed", async () => {
    const user = userEvent.setup();
    const onCheckedValuesChange = vi.fn();

    function StrictHost() {
      const [values, setValues] = React.useState<string[]>([]);
      return (
        <Tree
          aria-label="権限"
          treeData={PERMISSIONS}
          checkable
          checkStrictly
          defaultExpandAll
          checkedValues={values}
          onCheckedValuesChange={(next) => {
            onCheckedValuesChange(next);
            setValues(next);
          }}
        />
      );
    }
    render(<StrictHost />);

    await user.click(box("請求管理"));
    expect(onCheckedValuesChange).toHaveBeenLastCalledWith(["billing"]);
    expect(item("請求管理")).toHaveAttribute("aria-checked", "true");
    // The children are untouched — that is the whole point of the flag.
    expect(item("閲覧")).toHaveAttribute("aria-checked", "false");
    expect(item("発行")).toHaveAttribute("aria-checked", "false");

    await user.click(box("閲覧"));
    // One child in, one out, and the parent is still plainly "checked" — never "mixed".
    expect(item("請求管理")).toHaveAttribute("aria-checked", "true");
    expect(glyphState("請求管理")).toBe("checked");
  });
});

describe("Tree checkable — keyboard", () => {
  it("Enter and Space toggle the CHECKBOX when the tree is checkable", async () => {
    const user = userEvent.setup();
    render(<Host />);
    item("閲覧").focus();
    await user.keyboard("{Enter}");
    expect(item("閲覧")).toHaveAttribute("aria-checked", "true");
    await user.keyboard(" ");
    expect(item("閲覧")).toHaveAttribute("aria-checked", "false");
  });

  it("arrow navigation still works with checkboxes in the row", async () => {
    const user = userEvent.setup();
    render(<Host />);
    item("請求管理").focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toHaveAccessibleName("閲覧");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(item("発行")).toHaveAttribute("aria-checked", "true");
  });

  it("a disabled tree refuses every tick", async () => {
    const user = userEvent.setup();
    const onCheckedValuesChange = vi.fn();
    render(
      <Tree
        aria-label="権限"
        treeData={PERMISSIONS}
        checkable
        disabled
        defaultExpandAll
        onCheckedValuesChange={onCheckedValuesChange}
      />,
    );
    await user.click(box("閲覧"));
    item("閲覧").focus();
    await user.keyboard("{Enter}");
    expect(onCheckedValuesChange).not.toHaveBeenCalled();
  });
});
