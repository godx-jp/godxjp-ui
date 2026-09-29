/**
 * gh#1042 — a long child list. antd's `Tree` has no "load more" node; its answer is `height` +
 * `virtual` (rc-tree renders through rc-virtual-list). This is that port: with `height` the tree is
 * its own scroll viewport and only the rows in view are in the DOM, while `aria-level` /
 * `aria-setsize` / `aria-posinset` still describe the WHOLE outline (APG, dynamically loaded tree).
 *
 * jsdom has no layout, so the row box is stubbed: 32px per treeitem, the viewport its `height`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";

import { Tree } from "../tree";
import type { TreeNodeProp } from "../tree";

const ROW = 32;
const HEIGHT = 320; // ten rows

const SECTIONS: TreeNodeProp[] = Array.from({ length: 421 }, (_, index) => ({
  value: `s${index + 1}`,
  label: `Section ${index + 1}`,
}));
const TREE: TreeNodeProp[] = [{ value: "suite", label: "Suite", children: SECTIONS }];

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.getAttribute("role") === "treeitem" ? ROW : 0;
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.getAttribute("role") === "tree" ? HEIGHT : 0;
  });
});
afterEach(() => vi.restoreAllMocks());

const items = () => screen.getAllByRole("treeitem");

describe("Tree — height + virtual (gh#1042)", () => {
  it("renders a window of rows, not all 422, and states the whole outline in ARIA", async () => {
    render(<Tree aria-label="Sections" treeData={TREE} defaultExpandAll height={HEIGHT} />);
    const tree = screen.getByRole("tree");
    expect(tree).toHaveAttribute("data-virtual", "true");
    expect(tree.style.maxBlockSize).toBe(`${HEIGHT}px`);
    await waitFor(() => expect(items().length).toBeLessThan(30));

    const section = screen.getByRole("treeitem", { name: "Section 1" });
    expect(section).toHaveAttribute("aria-level", "2");
    expect(section).toHaveAttribute("aria-setsize", "421");
    expect(section).toHaveAttribute("aria-posinset", "1");
    // The rows below the window are room, not DOM: spacers, never padding (which under
    // border-box would out-grow max-block-size and turn the viewport into the whole outline).
    const rendered = items().length;
    const spacers = tree.querySelectorAll<HTMLElement>(".ui-tree-spacer");
    expect(spacers).toHaveLength(2);
    expect(spacers[0].style.blockSize).toBe("0px");
    expect(spacers[1].style.blockSize).toBe(`${(422 - rendered) * ROW}px`);
    expect(spacers[1]).toHaveAttribute("aria-hidden", "true");
    expect(tree.style.paddingBlockEnd).toBe("");
  });

  it("scrolling moves the window to the rows in view", async () => {
    render(<Tree aria-label="Sections" treeData={TREE} defaultExpandAll height={HEIGHT} />);
    const tree = screen.getByRole("tree");
    await waitFor(() => expect(items().length).toBeLessThan(30));
    tree.scrollTop = 300 * ROW;
    fireEvent.scroll(tree);
    expect(screen.getByRole("treeitem", { name: "Section 300" })).toHaveAttribute(
      "aria-posinset",
      "300",
    );
    expect(screen.queryByRole("treeitem", { name: "Suite" })).toBeNull();
    expect(items().length).toBeLessThan(30);
  });

  it("End reaches the last of 421 children, scrolled into the window and focused", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="Sections" treeData={TREE} defaultExpandAll height={HEIGHT} />);
    await waitFor(() => expect(items().length).toBeLessThan(30));
    screen.getByRole("treeitem", { name: "Suite" }).focus();
    await user.keyboard("{End}");
    const last = screen.getByRole("treeitem", { name: "Section 421" });
    expect(document.activeElement).toBe(last);
    expect(items().length).toBeLessThan(30);
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(screen.getByRole("treeitem", { name: "Suite" }));
  });

  it("the focused row survives a wheel-scroll away from it", async () => {
    render(<Tree aria-label="Sections" treeData={TREE} defaultExpandAll height={HEIGHT} />);
    const tree = screen.getByRole("tree");
    await waitFor(() => expect(items().length).toBeLessThan(30));
    screen.getByRole("treeitem", { name: "Section 2" }).focus();
    tree.scrollTop = 350 * ROW;
    fireEvent.scroll(tree);
    expect(document.activeElement).toBe(screen.getByRole("treeitem", { name: "Section 2" }));
  });

  it("Tab into a tree whose active row is scrolled out lands on that row", async () => {
    render(<Tree aria-label="Sections" treeData={TREE} defaultExpandAll height={HEIGHT} />);
    const tree = screen.getByRole("tree");
    await waitFor(() => expect(items().length).toBeLessThan(30));
    tree.scrollTop = 350 * ROW;
    fireEvent.scroll(tree);
    // The tab stop (the first row) is not rendered, so the tree itself holds it…
    expect(screen.queryByRole("treeitem", { name: "Suite" })).toBeNull();
    expect(tree).toHaveAttribute("tabindex", "0");
    // …and hands focus straight on.
    tree.focus();
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("treeitem", { name: "Suite" })),
    );
  });

  it("virtual={false} keeps the viewport but renders every row", () => {
    render(
      <Tree
        aria-label="Sections"
        treeData={TREE}
        defaultExpandAll
        height={HEIGHT}
        virtual={false}
      />,
    );
    const tree = screen.getByRole("tree");
    expect(tree.style.maxBlockSize).toBe(`${HEIGHT}px`);
    expect(tree).not.toHaveAttribute("data-virtual");
    expect(items()).toHaveLength(422);
  });

  it("a lazily-loaded 421-child level fills the window, busy row first", async () => {
    const user = userEvent.setup();
    let release: () => void = () => {};
    function Host() {
      const [data, setData] = React.useState<TreeNodeProp[]>([
        { value: "suite", label: "Suite", isLeaf: false },
      ]);
      return (
        <Tree
          aria-label="Sections"
          treeData={data}
          height={HEIGHT}
          loadData={(node) =>
            new Promise<void>((resolve) => {
              release = () => {
                setData([{ ...node, children: SECTIONS }]);
                resolve();
              };
            })
          }
        />
      );
    }
    render(<Host />);
    const suite = screen.getByRole("treeitem", { name: "Suite" });
    await user.click(suite.querySelector(".ui-tree-switcher")!);
    expect(screen.getByRole("treeitem", { name: "Suite" })).toHaveAttribute("aria-busy", "true");
    React.act(() => release());
    await waitFor(() => expect(screen.getByRole("treeitem", { name: "Section 1" })).toBeTruthy());
    expect(items().length).toBeLessThan(30);
  });
});
