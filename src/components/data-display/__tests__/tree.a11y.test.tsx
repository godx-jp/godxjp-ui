import { describe, it } from "vitest";

import { Tree } from "../tree";
import type { TreeNodeProp } from "../tree";
import { expectNoA11yViolations } from "@/test/a11y";

const TREE: TreeNodeProp[] = [
  {
    value: "asia",
    label: "アジア",
    children: [
      { value: "jp", label: "日本" },
      {
        value: "vn",
        label: "ベトナム",
        children: [{ value: "hcm", label: "ホーチミン" }],
      },
    ],
  },
  {
    value: "eu",
    label: "ヨーロッパ",
    children: [{ value: "fr", label: "フランス", disabled: true }],
  },
  { value: "antarctica", label: "南極", isLeaf: true },
];

// Tree hand-rolls the APG "Tree View" pattern (no Radix primitive owns it), so every one of its
// roles, relationships and states is audited here rather than trusted.
describe("Tree a11y", () => {
  it("has no axe violations while collapsed", async () => {
    await expectNoA11yViolations(<Tree aria-label="地域" treeData={TREE} />);
  });

  it("has no axe violations fully expanded, with a selected node", async () => {
    await expectNoA11yViolations(
      <Tree aria-label="地域" treeData={TREE} defaultExpandAll defaultValue="hcm" />,
    );
  });

  it("has no axe violations as a checkable tri-state tree", async () => {
    await expectNoA11yViolations(
      <Tree
        aria-label="権限"
        treeData={TREE}
        checkable
        defaultExpandAll
        defaultCheckedValues={["jp"]}
      />,
    );
  });

  it("has no axe violations as a multi-select tree", async () => {
    await expectNoA11yViolations(
      <Tree
        aria-label="地域"
        treeData={TREE}
        multiple
        defaultExpandAll
        defaultValue={["jp", "fr"]}
      />,
    );
  });

  it("has no axe violations as a directory tree with icons and rails", async () => {
    await expectNoA11yViolations(
      <Tree
        aria-label="ファイル"
        treeData={TREE}
        variant="directory"
        showIcon
        showLine
        size="sm"
        defaultExpandAll
      />,
    );
  });

  it("has no axe violations when named by a visible heading instead of aria-label", async () => {
    await expectNoA11yViolations(
      <div>
        <h2 id="tree-heading">部門</h2>
        <Tree aria-labelledby="tree-heading" treeData={TREE} defaultExpandAll />
      </div>,
    );
  });

  it("has no axe violations while disabled", async () => {
    await expectNoA11yViolations(
      <Tree aria-label="地域" treeData={TREE} disabled defaultExpandAll />,
    );
  });

  it("has no axe violations with an empty tree", async () => {
    await expectNoA11yViolations(<Tree aria-label="地域" treeData={[]} />);
  });
});
