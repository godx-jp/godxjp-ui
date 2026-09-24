import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";

import { Tree } from "../tree";
import type { TreeNodeProp } from "../tree";

/*
 * gh#732 — a page-index tree used as navigation inside a Card had no rule between its rows, so the
 * outline read as one block. `divided` draws a hairline on every node's block-start except the
 * outline's FIRST node, at the FULL width of the row on every level.
 *
 * jsdom does no layout and applies no stylesheet, so what is pinned here is the attribute the prop
 * emits and the stylesheet rules that act on it; the geometry (rule count, inline start/end vs the
 * node box at depth 0/1/2, row height and hit-target height before/after, the vertical
 * `--tree-line-color` rail unchanged) was measured in Chromium in light/dark and LTR/RTL when this
 * landed.
 */
const TREE: TreeNodeProp[] = [
  {
    value: "handbook",
    label: "ハンドブック",
    children: [
      { value: "handbook/onboarding", label: "入社手続き", isLeaf: true },
      {
        value: "handbook/security",
        label: "情報セキュリティ",
        children: [{ value: "handbook/security/passwords", label: "パスワード規程", isLeaf: true }],
      },
    ],
  },
  { value: "minutes", label: "議事録", isLeaf: true },
];

const css = () =>
  readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ");

describe("Tree divided (gh#732) — the prop", () => {
  it("declares itself on the tree container, and says nothing when it is off", () => {
    const { rerender } = render(<Tree aria-label="ページ一覧" treeData={TREE} divided />);
    expect(screen.getByRole("tree")).toHaveAttribute("data-divided", "true");

    // Off is the default, and an off tree carries no attribute at all — nothing to un-style.
    rerender(<Tree aria-label="ページ一覧" treeData={TREE} />);
    expect(screen.getByRole("tree")).not.toHaveAttribute("data-divided");
  });

  it("leaves the vertical parent/child rail to showLine — the two are separate axes", () => {
    render(<Tree aria-label="ページ一覧" treeData={TREE} divided defaultExpandAll />);
    const tree = screen.getByRole("tree");
    expect(tree).toHaveAttribute("data-divided", "true");
    expect(tree).not.toHaveAttribute("data-show-line");
  });

  it("changes no node geometry: the same rows, the same one tab stop, the same indent level", () => {
    const { container, rerender } = render(
      <Tree aria-label="ページ一覧" treeData={TREE} defaultExpandAll />,
    );
    const plain = [...container.querySelectorAll<HTMLElement>(".ui-tree-node")].map((node) => [
      node.getAttribute("style"),
      node.getAttribute("tabindex"),
      node.getAttribute("aria-level"),
    ]);

    rerender(<Tree aria-label="ページ一覧" treeData={TREE} defaultExpandAll divided />);
    const ruled = [...container.querySelectorAll<HTMLElement>(".ui-tree-node")].map((node) => [
      node.getAttribute("style"),
      node.getAttribute("tabindex"),
      node.getAttribute("aria-level"),
    ]);

    expect(ruled).toEqual(plain);
    // The row's own box knob is untouched — height still comes from the --control-height tier.
    expect(plain[0]?.[0]).toBe("--tree-node-level: 0;");
  });
});

describe("Tree divided (gh#732) — the CSS contract", () => {
  it("rules EVERY node's block-start from the token, with the documented fallback", () => {
    expect(css()).toContain(
      '.ui-tree[data-divided="true"] .ui-tree-node { border-block-start: var(--stroke-hairline) solid var(--tree-divider-color, hsl(var(--border))); }',
    );
  });

  it("exempts only the OUTLINE's first row, and by colour so the border box never moves", () => {
    // `> .ui-tree-node:first-child` is the first row of the tree itself. A group's first row still
    // follows its parent row, so it keeps its rule — that is the child-indent case in the issue.
    expect(css()).toContain(
      '.ui-tree[data-divided="true"] > .ui-tree-node:first-child { border-block-start-color: transparent; }',
    );
  });

  it("runs the FULL row width at every depth — the indent is padding on the row, never a margin", () => {
    const rules = css();
    // The ONE place a level is expressed: the row's own inline padding.
    expect(rules).toContain(
      "padding-inline-start: calc( var(--tree-node-padding-inline) + var(--tree-node-level, 0) * var(--tree-indent-width) );",
    );
    // Neither the divided rule nor the node carries an inline margin that would shorten the rule.
    expect(rules).not.toMatch(/\.ui-tree-node \{[^}]*margin-inline/);
    expect(rules).not.toMatch(/\.ui-tree\[data-divided="true"\][^{]*\{[^}]*margin-inline/);
  });

  it("keeps the vertical rail on its own token, untouched by the divider", () => {
    expect(css()).toContain(
      "border-inline-start: var(--stroke-hairline) solid var(--tree-line-color, hsl(var(--border)));",
    );
  });
});

describe("Tree divided (gh#732) — the token", () => {
  const tokens = () =>
    readFileSync(join(process.cwd(), "src/tokens/components/tree.css"), "utf8").replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );

  it("is a role-mirror knob: `initial` at :root, the --border default read at the call site", () => {
    // Bound to `hsl(var(--border))` at :root it would compute ONCE against the root's --border and
    // a scoped `[data-tenant]` / `.dark` retint would never reach it (docs/TOKENS.md, the freeze
    // rule — src/tokens/__tests__/tenant-scope-freeze-687.test.ts).
    expect(tokens()).toMatch(/--tree-divider-color:\s*initial;/);
    expect(tokens()).not.toMatch(/--tree-divider-color:\s*hsl\(/);
  });

  it("reads the LIGHT divider tier, never the heavier --input one (gh#730)", () => {
    expect(css()).toContain("var(--tree-divider-color, hsl(var(--border)))");
    expect(css()).not.toContain("var(--tree-divider-color, hsl(var(--input)");
  });

  it("is overridable in a scope, the way a theme retints it without a utility class", () => {
    const { container } = render(
      <div style={{ "--tree-divider-color": "hsl(var(--primary))" } as React.CSSProperties}>
        <Tree aria-label="ページ一覧" treeData={TREE} divided />
      </div>,
    );
    const scope = container.firstElementChild as HTMLElement;
    expect(scope.style.getPropertyValue("--tree-divider-color")).toBe("hsl(var(--primary))");
    // The scope owns the colour; the tree itself writes no inline style for it.
    expect(scope.querySelector<HTMLElement>(".ui-tree")!.getAttribute("style")).toBeNull();
  });
});
