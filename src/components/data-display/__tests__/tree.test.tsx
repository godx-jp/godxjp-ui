import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";

import { Tree } from "../tree";
import type { TreeNodeProp } from "../tree";

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

const names = () => screen.getAllByRole("treeitem").map((node) => node.textContent);

describe("Tree — APG semantics", () => {
  it("is a role=tree whose nodes carry level / setsize / posinset", () => {
    render(<Tree aria-label="地域" treeData={TREE} defaultExpandAll />);

    const tree = screen.getByRole("tree", { name: "地域" });
    expect(tree).toBeInTheDocument();

    const asia = screen.getByRole("treeitem", { name: "アジア" });
    expect(asia).toHaveAttribute("aria-level", "1");
    expect(asia).toHaveAttribute("aria-setsize", "3");
    expect(asia).toHaveAttribute("aria-posinset", "1");

    const hcm = screen.getByRole("treeitem", { name: "ホーチミン" });
    expect(hcm).toHaveAttribute("aria-level", "3");
    expect(hcm).toHaveAttribute("aria-setsize", "1");
    expect(hcm).toHaveAttribute("aria-posinset", "1");
  });

  it("puts aria-expanded ONLY on nodes that have children", () => {
    render(<Tree aria-label="地域" treeData={TREE} defaultExpandAll />);

    expect(screen.getByRole("treeitem", { name: "アジア" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    // A leaf must not promise an affordance it does not have.
    expect(screen.getByRole("treeitem", { name: "日本" })).not.toHaveAttribute("aria-expanded");
    expect(screen.getByRole("treeitem", { name: "南極" })).not.toHaveAttribute("aria-expanded");
  });

  it("wraps each open branch in a role=group the parent explicitly owns", () => {
    render(<Tree aria-label="地域" treeData={TREE} defaultExpandedValues={["asia"]} />);

    const asia = screen.getByRole("treeitem", { name: "アジア" });
    const groupId = asia.getAttribute("aria-owns");
    expect(groupId).toBeTruthy();
    const group = document.getElementById(groupId!);
    expect(group).toHaveAttribute("role", "group");
    expect(within(group!).getByRole("treeitem", { name: "日本" })).toBeInTheDocument();
  });

  it("keeps EXACTLY one node in the tab ring (roving tabindex)", () => {
    render(<Tree aria-label="地域" treeData={TREE} defaultExpandAll />);
    const tabbable = screen
      .getAllByRole("treeitem")
      .filter((node) => node.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName("アジア");
  });

  it("anchors the roving tab stop on the selected node when there is one", () => {
    render(<Tree aria-label="地域" treeData={TREE} defaultExpandAll defaultValue="fr" />);
    const tabbable = screen
      .getAllByRole("treeitem")
      .filter((node) => node.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName("フランス");
  });

  it("marks the tree multiselectable only when it actually is", () => {
    const { rerender } = render(<Tree aria-label="地域" treeData={TREE} />);
    expect(screen.getByRole("tree")).toHaveAttribute("aria-multiselectable", "false");
    rerender(<Tree aria-label="地域" treeData={TREE} multiple />);
    expect(screen.getByRole("tree")).toHaveAttribute("aria-multiselectable", "true");
    rerender(<Tree aria-label="地域" treeData={TREE} checkable />);
    expect(screen.getByRole("tree")).toHaveAttribute("aria-multiselectable", "true");
  });

  it("forwards ref, id, className and unknown props onto the tree container", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Tree
        ref={ref}
        id="region-tree"
        className="custom-tree"
        data-testid="region"
        aria-label="地域"
        treeData={TREE}
      />,
    );
    const tree = screen.getByRole("tree");
    expect(ref.current).toBe(tree);
    expect(tree).toHaveAttribute("id", "region-tree");
    expect(tree).toHaveClass("ui-tree", "custom-tree");
    expect(tree).toHaveAttribute("data-testid", "region");
  });
});

describe("Tree — expansion", () => {
  it("collapsed branches render no children at all", () => {
    render(<Tree aria-label="地域" treeData={TREE} />);
    expect(names()).toEqual(["アジア", "ヨーロッパ", "南極"]);
  });

  it("clicking the disclosure triangle expands without selecting", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tree aria-label="地域" treeData={TREE} onValueChange={onValueChange} />);

    const asia = screen.getByRole("treeitem", { name: "アジア" });
    await user.click(asia.querySelector(".ui-tree-switcher")!);

    expect(asia).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("treeitem", { name: "日本" })).toBeInTheDocument();
    // Expanding is navigation, never a selection.
    expect(onValueChange).not.toHaveBeenCalled();
    expect(asia).toHaveAttribute("aria-selected", "false");
  });

  it("runs expansion as a controlled triad", async () => {
    const user = userEvent.setup();
    const onExpandedValuesChange = vi.fn();
    render(
      <Tree
        aria-label="地域"
        treeData={TREE}
        expandedValues={[]}
        onExpandedValuesChange={onExpandedValuesChange}
      />,
    );
    await user.click(
      screen.getByRole("treeitem", { name: "アジア" }).querySelector(".ui-tree-switcher")!,
    );
    expect(onExpandedValuesChange).toHaveBeenCalledWith(["asia"]);
    // Controlled means the OWNER decides — the tree did not open itself.
    expect(screen.queryByRole("treeitem", { name: "日本" })).not.toBeInTheDocument();
  });

  it("defaultExpandAll opens every branch, and isLeaf keeps a childless node closed", () => {
    render(<Tree aria-label="地域" treeData={TREE} defaultExpandAll />);
    expect(names()).toEqual([
      "アジア",
      "日本",
      "ベトナム",
      "ホーチミン",
      "ヨーロッパ",
      "フランス",
      "南極",
    ]);
  });
});

describe("Tree — selection", () => {
  it("selects a node on row click and reports the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tree aria-label="地域" treeData={TREE} defaultExpandAll onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("treeitem", { name: "日本" }));
    expect(onValueChange).toHaveBeenCalledWith("jp");
    expect(screen.getByRole("treeitem", { name: "日本" })).toHaveAttribute("aria-selected", "true");
  });

  it("never states selection by colour alone — it also says so in words", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="地域" treeData={TREE} defaultExpandAll />);
    const jp = screen.getByRole("treeitem", { name: "日本" });
    expect(jp.querySelector(".sr-only")).toBeNull();
    await user.click(jp);
    expect(jp.querySelector(".sr-only")?.textContent).toBe("Đã chọn");
  });

  it("multiple accumulates and reports an array", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tree
        aria-label="地域"
        treeData={TREE}
        multiple
        defaultExpandAll
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("treeitem", { name: "日本" }));
    await user.click(screen.getByRole("treeitem", { name: "フランス" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["jp", "fr"]);
  });

  it("a disabled node and a disabled tree refuse to select or expand", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const data: TreeNodeProp[] = [
      { value: "a", label: "使えます" },
      { value: "b", label: "使えません", disabled: true },
    ];
    const { rerender } = render(
      <Tree aria-label="地域" treeData={data} onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("treeitem", { name: "使えません" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("treeitem", { name: "使えません" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    rerender(<Tree aria-label="地域" treeData={TREE} disabled onValueChange={onValueChange} />);
    await user.click(screen.getByRole("treeitem", { name: "アジア" }));
    await user.click(
      screen.getByRole("treeitem", { name: "アジア" }).querySelector(".ui-tree-switcher")!,
    );
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("treeitem", { name: "日本" })).not.toBeInTheDocument();
  });
});

describe("Tree — presentation props", () => {
  it("size lands on the container as a tier, never as a literal height", () => {
    render(<Tree aria-label="地域" treeData={TREE} size="xs" />);
    expect(screen.getByRole("tree")).toHaveAttribute("data-size", "xs");
    expect(screen.getByRole("tree").getAttribute("style")).toBeNull();
  });

  it("showLine and variant=directory are declared on the container", () => {
    render(<Tree aria-label="地域" treeData={TREE} showLine variant="directory" />);
    const tree = screen.getByRole("tree");
    expect(tree).toHaveAttribute("data-show-line", "true");
    expect(tree).toHaveAttribute("data-variant", "directory");
  });

  it("showIcon draws the per-node icon, and directory supplies folder/file glyphs", () => {
    const data: TreeNodeProp[] = [
      { value: "root", label: "ルート", children: [{ value: "leaf", label: "リーフ" }] },
    ];
    const { rerender } = render(
      <Tree aria-label="地域" treeData={data} showIcon defaultExpandAll variant="directory" />,
    );
    expect(
      screen.getByRole("treeitem", { name: "ルート" }).querySelector(".ui-tree-icon"),
    ).not.toBeNull();

    // Without showIcon there is no glyph slot at all.
    rerender(<Tree aria-label="地域" treeData={data} defaultExpandAll variant="directory" />);
    expect(
      screen.getByRole("treeitem", { name: "ルート" }).querySelector(".ui-tree-icon"),
    ).toBeNull();
  });

  it("titleRender replaces the label, and fieldNames remaps the data keys", () => {
    render(
      <Tree
        aria-label="組織"
        treeData={
          [
            { id: "jp", name: "日本法人", units: [{ id: "jp-dev", name: "開発部" }] },
          ] as unknown as TreeNodeProp[]
        }
        fieldNames={{ label: "name", value: "id", children: "units" }}
        titleRender={(node) => <span>[{node.value}]</span>}
        defaultExpandAll
      />,
    );
    expect(screen.getByRole("treeitem", { name: "[jp]" })).toBeInTheDocument();
    expect(screen.getByRole("treeitem", { name: "[jp-dev]" })).toBeInTheDocument();
  });

  it("an empty tree says so instead of rendering a blank box", () => {
    render(<Tree aria-label="地域" treeData={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("Không có gì để hiển thị");
    expect(screen.queryAllByRole("treeitem")).toHaveLength(0);
  });
});

describe("Tree — async children (loadData)", () => {
  const asyncData: TreeNodeProp[] = [{ value: "jp", label: "日本法人", isLeaf: false }];

  it("fetches once per node, shows a busy row, then renders what arrived", async () => {
    const user = userEvent.setup();
    let resolveLoad: () => void = () => {};
    const loadData = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve;
        }),
    );

    function Host() {
      const [data, setData] = React.useState(asyncData);
      return (
        <Tree
          aria-label="組織"
          treeData={data}
          loadData={async (node) => {
            await loadData();
            setData([{ ...node, children: [{ value: "jp-dev", label: "開発部" }] }]);
          }}
        />
      );
    }

    render(<Host />);
    const jp = screen.getByRole("treeitem", { name: "日本法人" });
    // A childless node that is NOT declared a leaf is UNRESOLVED — it must still read expandable.
    expect(jp).toHaveAttribute("aria-expanded", "false");

    await user.click(jp.querySelector(".ui-tree-switcher")!);
    expect(loadData).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.getByRole("treeitem", { name: "日本法人" })).toHaveAttribute(
        "aria-busy",
        "true",
      ),
    );

    resolveLoad();
    await waitFor(() =>
      expect(screen.getByRole("treeitem", { name: "開発部" })).toBeInTheDocument(),
    );

    // Collapse and re-expand: the ledger means it is never refetched.
    await user.click(
      screen.getByRole("treeitem", { name: "日本法人" }).querySelector(".ui-tree-switcher")!,
    );
    await user.click(
      screen.getByRole("treeitem", { name: "日本法人" }).querySelector(".ui-tree-switcher")!,
    );
    expect(loadData).toHaveBeenCalledTimes(1);
  });

  it("never asks for a node declared isLeaf", async () => {
    const user = userEvent.setup();
    const loadData = vi.fn();
    render(
      <Tree
        aria-label="組織"
        treeData={[{ value: "jp", label: "日本法人", isLeaf: true }]}
        loadData={loadData}
      />,
    );
    await user.click(screen.getByRole("treeitem", { name: "日本法人" }));
    expect(loadData).not.toHaveBeenCalled();
  });
});
