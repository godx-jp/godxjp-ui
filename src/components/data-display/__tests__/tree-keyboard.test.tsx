import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tree } from "../tree";
import type { TreeNodeProp } from "../tree";

/**
 * The WAI-ARIA APG "Tree View" keyboard contract, driven key by key.
 *
 * Every assertion here was first driven by hand in a real browser (see the report's evidence
 * ledger); this file is the permanent regression guard so the browser is never needed again.
 */
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
    children: [{ value: "fr", label: "フランス" }],
  },
  { value: "antarctica", label: "南極", isLeaf: true },
];

const item = (name: string) => screen.getByRole("treeitem", { name });
const focused = () => document.activeElement as HTMLElement;

describe("Tree keyboard — moving through the visible nodes", () => {
  it("ArrowDown / ArrowUp walk the VISIBLE nodes, crossing levels", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} defaultExpandAll />);

    item("アジア").focus();
    await user.keyboard("{ArrowDown}");
    expect(focused()).toHaveAccessibleName("日本");
    await user.keyboard("{ArrowDown}");
    expect(focused()).toHaveAccessibleName("ベトナム");
    await user.keyboard("{ArrowDown}");
    // Down crosses INTO a deeper level — it follows what is on screen, not the sibling list.
    expect(focused()).toHaveAccessibleName("ホーチミン");
    await user.keyboard("{ArrowDown}");
    expect(focused()).toHaveAccessibleName("ヨーロッパ");
    await user.keyboard("{ArrowUp}");
    expect(focused()).toHaveAccessibleName("ホーチミン");
  });

  it("ArrowDown skips what a collapsed branch is hiding", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} />);
    item("アジア").focus();
    await user.keyboard("{ArrowDown}");
    expect(focused()).toHaveAccessibleName("ヨーロッパ");
  });

  it("stops at both ends instead of wrapping", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} />);
    item("アジア").focus();
    await user.keyboard("{ArrowUp}");
    expect(focused()).toHaveAccessibleName("アジア");
    item("南極").focus();
    await user.keyboard("{ArrowDown}");
    expect(focused()).toHaveAccessibleName("南極");
  });

  it("Home / End jump to the first and last VISIBLE node", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} defaultExpandAll />);
    item("ヨーロッパ").focus();
    await user.keyboard("{Home}");
    expect(focused()).toHaveAccessibleName("アジア");
    await user.keyboard("{End}");
    expect(focused()).toHaveAccessibleName("南極");
  });

  it("moves the tab stop with the focus — still exactly one", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} defaultExpandAll />);
    item("アジア").focus();
    await user.keyboard("{ArrowDown}");
    const tabbable = screen
      .getAllByRole("treeitem")
      .filter((node) => node.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName("日本");
  });
});

describe("Tree keyboard — ArrowRight / ArrowLeft (LTR)", () => {
  it("ArrowRight opens a closed branch, then descends into it", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} />);
    item("アジア").focus();

    await user.keyboard("{ArrowRight}");
    expect(item("アジア")).toHaveAttribute("aria-expanded", "true");
    // First press only OPENS — focus stays put.
    expect(focused()).toHaveAccessibleName("アジア");

    await user.keyboard("{ArrowRight}");
    expect(focused()).toHaveAccessibleName("日本");
  });

  it("ArrowRight on a leaf does nothing at all", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} />);
    item("南極").focus();
    await user.keyboard("{ArrowRight}");
    expect(focused()).toHaveAccessibleName("南極");
  });

  it("ArrowLeft closes an open branch, then climbs to the parent", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} defaultExpandAll />);

    item("ホーチミン").focus();
    await user.keyboard("{ArrowLeft}");
    // A leaf has nothing to close, so it climbs immediately.
    expect(focused()).toHaveAccessibleName("ベトナム");

    await user.keyboard("{ArrowLeft}");
    expect(item("ベトナム")).toHaveAttribute("aria-expanded", "false");
    expect(focused()).toHaveAccessibleName("ベトナム");

    await user.keyboard("{ArrowLeft}");
    expect(focused()).toHaveAccessibleName("アジア");
  });

  it("ArrowLeft at the root does nothing", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} />);
    item("ヨーロッパ").focus();
    await user.keyboard("{ArrowLeft}");
    expect(focused()).toHaveAccessibleName("ヨーロッパ");
  });
});

describe("Tree keyboard — RTL swaps the horizontal arrows", () => {
  it("ArrowLeft opens and ArrowRight closes under dir=rtl", async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <Tree aria-label="地域" treeData={TREE} />
      </div>,
    );

    item("アジア").focus();
    await user.keyboard("{ArrowLeft}");
    expect(item("アジア")).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowLeft}");
    expect(focused()).toHaveAccessibleName("日本");

    // And the reverse: the OUTWARD key is now ArrowRight.
    await user.keyboard("{ArrowRight}");
    expect(focused()).toHaveAccessibleName("アジア");
    await user.keyboard("{ArrowRight}");
    expect(item("アジア")).toHaveAttribute("aria-expanded", "false");
  });

  it("leaves the LTR meaning alone when there is no dir=rtl above it", async () => {
    const user = userEvent.setup();
    render(
      <div dir="ltr">
        <Tree aria-label="地域" treeData={TREE} />
      </div>,
    );
    item("アジア").focus();
    await user.keyboard("{ArrowLeft}");
    expect(item("アジア")).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{ArrowRight}");
    expect(item("アジア")).toHaveAttribute("aria-expanded", "true");
  });
});

describe("Tree keyboard — activation, star and type-ahead", () => {
  it("Enter and Space select the focused node", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tree aria-label="地域" treeData={TREE} defaultExpandAll onValueChange={onValueChange} />,
    );
    item("日本").focus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("jp");
    expect(item("日本")).toHaveAttribute("aria-selected", "true");

    item("フランス").focus();
    await user.keyboard(" ");
    expect(onValueChange).toHaveBeenLastCalledWith("fr");
  });

  it("Space does not scroll the page away under the tree", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} />);
    item("アジア").focus();
    const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    focused().dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    await user.keyboard("{ArrowDown}");
  });

  it("* expands every sibling at the CURRENT level, and nothing deeper", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} />);

    item("アジア").focus();
    await user.keyboard("*");

    expect(item("アジア")).toHaveAttribute("aria-expanded", "true");
    expect(item("ヨーロッパ")).toHaveAttribute("aria-expanded", "true");
    // "ベトナム" is one level deeper — * does not reach it.
    expect(item("ベトナム")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("treeitem", { name: "ホーチミン" })).not.toBeInTheDocument();
  });

  it("* at a nested level opens only that level's siblings", async () => {
    const user = userEvent.setup();
    const data: TreeNodeProp[] = [
      {
        value: "root",
        label: "ルート",
        children: [
          { value: "a", label: "エー", children: [{ value: "a1", label: "エーの子" }] },
          { value: "b", label: "ビー", children: [{ value: "b1", label: "ビーの子" }] },
        ],
      },
      { value: "other", label: "その他", children: [{ value: "o1", label: "その他の子" }] },
    ];
    render(<Tree aria-label="地域" treeData={data} defaultExpandedValues={["root"]} />);

    item("エー").focus();
    await user.keyboard("*");
    expect(item("エー")).toHaveAttribute("aria-expanded", "true");
    expect(item("ビー")).toHaveAttribute("aria-expanded", "true");
    // A sibling of the PARENT is a different level and must stay closed.
    expect(item("その他")).toHaveAttribute("aria-expanded", "false");
  });

  it("type-ahead jumps to the next node whose label starts with what was typed", async () => {
    const user = userEvent.setup();
    const data: TreeNodeProp[] = [
      { value: "alpha", label: "alpha" },
      { value: "beta", label: "beta" },
      { value: "berlin", label: "berlin" },
      { value: "gamma", label: "gamma" },
    ];
    render(<Tree aria-label="地域" treeData={data} />);

    item("alpha").focus();
    await user.keyboard("b");
    expect(focused()).toHaveAccessibleName("beta");

    // A second key REFINES the search rather than starting a new one — "b" then "e" is "be".
    await user.keyboard("e");
    expect(focused()).toHaveAccessibleName("berlin");

    // And a third that matches nothing holds still rather than jumping somewhere arbitrary.
    await user.keyboard("z");
    expect(focused()).toHaveAccessibleName("berlin");
  });

  it("restarts the type-ahead buffer after a pause, and wraps past the end", async () => {
    const user = userEvent.setup();
    const data: TreeNodeProp[] = [
      { value: "alpha", label: "alpha" },
      { value: "beta", label: "beta" },
      { value: "gamma", label: "gamma" },
    ];
    const base = Date.now();
    const clock = vi.spyOn(Date, "now").mockReturnValue(base);
    render(<Tree aria-label="地域" treeData={data} />);

    item("alpha").focus();
    await user.keyboard("g");
    expect(focused()).toHaveAccessibleName("gamma");

    // Past the reset window the next key starts a NEW search instead of appending to "g".
    clock.mockReturnValue(base + 2000);
    await user.keyboard("a");
    // Search starts AFTER the focused node and wraps around the end of the list.
    expect(focused()).toHaveAccessibleName("alpha");
    clock.mockRestore();
  });

  it("type-ahead only looks at VISIBLE nodes", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} />);
    item("アジア").focus();
    await user.keyboard("日");
    // 日本 is hidden inside a collapsed branch — nothing to jump to.
    expect(focused()).toHaveAccessibleName("アジア");
  });
});
