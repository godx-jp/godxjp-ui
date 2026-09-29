/**
 * gh#1043 — antd `filterTreeNode`: a node the predicate returns true for is HIGHLIGHTED (rc-tree
 * adds `filter-node` to the row), never hidden; the outline, keyboard and ARIA stay untouched.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tree } from "../tree";
import type { TreeNodeProp } from "../tree";

const TREE: TreeNodeProp[] = [
  {
    value: "login",
    label: "Login",
    children: [
      { value: "login-ok", label: "Login succeeds" },
      { value: "logout", label: "Logout" },
    ],
  },
  { value: "billing", label: "Billing" },
];

const byLogin = (node: TreeNodeProp) => String(node.label).startsWith("Login");

describe("Tree — filterTreeNode (gh#1043)", () => {
  it("marks exactly the matching rows and hides nothing", () => {
    render(<Tree aria-label="Suites" treeData={TREE} defaultExpandAll filterTreeNode={byLogin} />);
    const rows = screen.getAllByRole("treeitem");
    expect(rows).toHaveLength(4);
    const marked = rows.filter((row) => row.getAttribute("data-filter-node") === "true");
    expect(marked.map((row) => row.getAttribute("data-value"))).toEqual(["login", "login-ok"]);
  });

  it("keeps the accessible name and the ARIA position; the match is also words (sr-only)", () => {
    render(<Tree aria-label="Suites" treeData={TREE} defaultExpandAll filterTreeNode={byLogin} />);
    const match = screen.getByRole("treeitem", { name: "Login succeeds" });
    expect(match).toHaveAttribute("aria-level", "2");
    expect(match).toHaveAttribute("aria-posinset", "1");
    expect(match).toHaveAttribute("aria-setsize", "2");
    // vi is the test default locale.
    expect(match).toHaveTextContent("Khớp bộ lọc");
    expect(screen.getByRole("treeitem", { name: "Logout" })).not.toHaveAttribute(
      "data-filter-node",
    );
  });

  it("the keyboard still walks every row, matched or not", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="Suites" treeData={TREE} defaultExpandAll filterTreeNode={byLogin} />);
    screen.getByRole("treeitem", { name: "Login" }).focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(screen.getByRole("treeitem", { name: "Billing" }));
  });

  it("without the prop nothing is marked", () => {
    render(<Tree aria-label="Suites" treeData={TREE} defaultExpandAll />);
    expect(document.querySelector("[data-filter-node]")).toBeNull();
  });

  it("styles the label with the filter knob and a non-colour cue, never on a disabled row", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
    const rule = css.match(
      /\.ui-tree-node\[data-filter-node="true"\]:not\(\[data-disabled\]\) \.ui-tree-label \{([^}]*)\}/,
    );
    expect(rule, "filter-node rule").not.toBeNull();
    expect(rule![1]).toContain("var(--tree-node-filter-foreground, hsl(var(--primary)))");
    expect(rule![1]).toContain("font-weight: var(--font-weight-medium)");
  });
});
