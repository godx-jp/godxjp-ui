import type { Meta, StoryObj } from "@storybook/react";
import { Folder, FolderOpen, FileText } from "lucide-react";
import { Tree } from "../../../../components/data-display/Tree";
import type { TreeNode } from "../../../../components/data-display/Tree";

/**
 * new-primitives/components/data-display/Tree — hierarchical view.
 *
 * Standalone sibling of `<TreeSelect>` — renders inline (no popover).
 *
 * Documented props (per `Tree.tsx`):
 *   treeData, value, defaultValue, onValueChange, multiple,
 *   defaultExpandedKeys, expandedKeys, onExpandedKeysChange,
 *   checkable, showLine, className
 *
 * Stories use the documented APIs only (cardinal rule 25).
 */

const meta: Meta<typeof Tree> = {
  title: "new-primitives/Components/Data Display/Tree",
  component: Tree,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Tree** — recursive hierarchical view, inline (not a popover).

Vocabulary (cardinal rule 23 §B): \`value\` / \`defaultValue\` /
\`onValueChange\` for selection, \`expandedKeys\` / \`defaultExpandedKeys\`
/ \`onExpandedKeysChange\` for expansion, \`multiple\`, \`checkable\`,
\`showLine\` for visual variants.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tree>;

// ─── Org chart — three levels ───────────────────────────────────

const ORG_TREE: TreeNode[] = [
  {
    key: "company",
    title: "ファミギア株式会社",
    children: [
      {
        key: "eng",
        title: "エンジニアリング本部",
        children: [
          { key: "fe", title: "フロントエンドチーム" },
          { key: "be", title: "バックエンドチーム" },
          { key: "infra", title: "インフラチーム" },
        ],
      },
      {
        key: "design",
        title: "デザイン本部",
        children: [
          { key: "ui", title: "UI デザインチーム" },
          { key: "ux", title: "UX リサーチチーム" },
        ],
      },
      {
        key: "ops",
        title: "コーポレート本部",
        children: [
          { key: "hr", title: "人事部" },
          { key: "fin", title: "経理部" },
        ],
      },
    ],
  },
];

export const Default: Story = {
  name: "Default · org tree (3 levels)",
  render: () => (
    <Tree
      treeData={ORG_TREE}
      defaultExpandedKeys={["company", "eng"]}
      defaultValue="fe"
    />
  ),
};

// ─── Multi-select with checkboxes ───────────────────────────────

export const MultipleCheckable: Story = {
  name: "Multiple · checkable departments",
  render: () => (
    <Tree
      treeData={ORG_TREE}
      checkable
      defaultExpandedKeys={["company", "eng", "design"]}
      defaultValue={["fe", "ui"]}
    />
  ),
};

// ─── With connector lines ───────────────────────────────────────

const FILE_TREE: TreeNode[] = [
  {
    key: "src",
    title: "src",
    icon: <Folder size={14} />,
    children: [
      {
        key: "components",
        title: "components",
        icon: <Folder size={14} />,
        children: [
          {
            key: "btn",
            title: "Button.tsx",
            icon: <FileText size={14} />,
          },
          {
            key: "input",
            title: "Input.tsx",
            icon: <FileText size={14} />,
          },
          {
            key: "card",
            title: "Card.tsx",
            icon: <FileText size={14} />,
          },
        ],
      },
      {
        key: "hooks",
        title: "hooks",
        icon: <FolderOpen size={14} />,
        children: [
          {
            key: "use-bp",
            title: "useBreakpoint.ts",
            icon: <FileText size={14} />,
          },
        ],
      },
      {
        key: "index",
        title: "index.ts",
        icon: <FileText size={14} />,
      },
    ],
  },
];

export const WithLines: Story = {
  name: "WithLines · file explorer w/ connector lines",
  render: () => (
    <Tree
      treeData={FILE_TREE}
      showLine
      defaultExpandedKeys={["src", "components", "hooks"]}
      defaultValue="btn"
    />
  ),
};

// ─── ExpandedByDefault — every node open ────────────────────────

export const ExpandedByDefault: Story = {
  name: "ExpandedByDefault · org tree all open",
  render: () => (
    <Tree
      treeData={ORG_TREE}
      defaultExpandedKeys={[
        "company",
        "eng",
        "design",
        "ops",
      ]}
    />
  ),
};

// ─── Disabled nodes ─────────────────────────────────────────────

const TREE_WITH_DISABLED: TreeNode[] = [
  {
    key: "available",
    title: "利用可能なリソース",
    children: [
      { key: "r1", title: "サーバー A" },
      { key: "r2", title: "サーバー B" },
      {
        key: "r3",
        title: "サーバー C (メンテナンス中)",
        disabled: true,
      },
    ],
  },
  {
    key: "archive",
    title: "アーカイブ (読み取り専用)",
    disabled: true,
    children: [
      { key: "a1", title: "旧サーバー X", disabled: true },
      { key: "a2", title: "旧サーバー Y", disabled: true },
    ],
  },
];

export const Disabled: Story = {
  name: "Disabled · per-node + per-branch disable",
  render: () => (
    <Tree
      treeData={TREE_WITH_DISABLED}
      defaultExpandedKeys={["available", "archive"]}
      defaultValue="r1"
    />
  ),
};
