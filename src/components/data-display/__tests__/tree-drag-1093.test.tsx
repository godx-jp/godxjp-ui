import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, createEvent, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppProvider } from "../../../app/app-provider";
import { Tree } from "../tree";
import type { TreeDropInfoProp, TreeNodeProp } from "../tree";

/**
 * gh#1093 — antd `draggable` / `allowDrop` / `onDrop` parity, plus the keyboard path WCAG 2.5.7
 * requires of a drag-only interaction.
 */
const TREE: TreeNodeProp[] = [
  {
    value: "guide",
    label: "Guide",
    children: [
      { value: "intro", label: "Intro" },
      { value: "setup", label: "Setup" },
    ],
  },
  { value: "faq", label: "FAQ" },
  { value: "notes", label: "Notes" },
];

const renderEn = (ui: React.ReactElement) =>
  render(
    <AppProvider persist={false} defaultLocale="en" fallbackLocale="en">
      {ui}
    </AppProvider>,
  );

const item = (name: string) => screen.getByRole("treeitem", { name });

/** jsdom has no layout: give a row a 40px box at `top` so the drop quarter is measurable. */
function placeRow(row: HTMLElement, top: number) {
  row.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + 40,
      height: 40,
      left: 0,
      right: 200,
      width: 200,
      x: 0,
      y: top,
    }) as DOMRect;
}

function dataTransfer() {
  const data = new Map<string, string>();
  return {
    effectAllowed: "all",
    dropEffect: "none",
    setData: (type: string, value: string) => data.set(type, value),
    getData: (type: string) => data.get(type) ?? "",
  };
}

/** jsdom has no DragEvent, so `clientY` is set on the event by hand. */
function fireAt(
  type: "dragOver" | "drop",
  target: HTMLElement,
  transfer: ReturnType<typeof dataTransfer>,
  clientY: number,
) {
  const event = createEvent[type](target, { dataTransfer: transfer });
  Object.defineProperty(event, "clientY", { value: clientY });
  fireEvent(target, event);
}

function drag(from: HTMLElement, to: HTMLElement, clientY: number) {
  const transfer = dataTransfer();
  fireEvent.dragStart(from, { dataTransfer: transfer });
  fireAt("dragOver", to, transfer, clientY);
  fireAt("drop", to, transfer, clientY);
  fireEvent.dragEnd(from, { dataTransfer: transfer });
}

const names = (info: TreeDropInfoProp) => ({
  dragNode: info.dragNode.value,
  node: info.node.value,
  dropPosition: info.dropPosition,
  dropToGap: info.dropToGap,
});

describe("Tree draggable — pointer (gh#1093)", () => {
  it("is off by default: rows are not draggable", () => {
    render(<Tree aria-label="Docs" treeData={TREE} />);
    expect(item("FAQ")).not.toHaveAttribute("draggable");
  });

  it("reports before / inside / after from the row quarter it lands on", () => {
    const onDrop = vi.fn();
    render(<Tree aria-label="Docs" treeData={TREE} draggable onDrop={onDrop} />);
    const target = item("FAQ");
    placeRow(target, 100);
    expect(item("Notes")).toHaveAttribute("draggable", "true");

    drag(item("Notes"), target, 102);
    drag(item("Notes"), target, 120);
    drag(item("Notes"), target, 138);

    expect(onDrop.mock.calls.map(([info]) => names(info))).toEqual([
      { dragNode: "notes", node: "faq", dropPosition: -1, dropToGap: true },
      { dragNode: "notes", node: "faq", dropPosition: 0, dropToGap: false },
      { dragNode: "notes", node: "faq", dropPosition: 1, dropToGap: true },
    ]);
  });

  it("marks the dragged row and the drop target while the drag is over it", () => {
    render(<Tree aria-label="Docs" treeData={TREE} draggable />);
    const target = item("FAQ");
    placeRow(target, 0);
    const transfer = dataTransfer();
    fireEvent.dragStart(item("Notes"), { dataTransfer: transfer });
    expect(item("Notes")).toHaveAttribute("data-dragging", "true");
    fireAt("dragOver", target, transfer, 38);
    expect(target).toHaveAttribute("data-drop-position", "after");
    fireEvent.dragEnd(item("Notes"), { dataTransfer: transfer });
    expect(target).not.toHaveAttribute("data-drop-position");
    expect(item("Notes")).not.toHaveAttribute("data-dragging");
  });

  it("never drops a node into itself or its own subtree", () => {
    const onDrop = vi.fn();
    render(<Tree aria-label="Docs" treeData={TREE} draggable defaultExpandAll onDrop={onDrop} />);
    placeRow(item("Intro"), 0);
    placeRow(item("Guide"), 0);
    drag(item("Guide"), item("Intro"), 20);
    drag(item("Guide"), item("Guide"), 20);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("asks allowDrop and allowDrag", () => {
    const onDrop = vi.fn();
    const allowDrop = vi.fn(({ dropPosition }: { dropPosition: number }) => dropPosition !== 0);
    render(
      <Tree
        aria-label="Docs"
        treeData={TREE}
        draggable
        allowDrag={(node) => node.value !== "faq"}
        allowDrop={allowDrop}
        onDrop={onDrop}
      />,
    );
    expect(item("FAQ")).not.toHaveAttribute("draggable");
    placeRow(item("FAQ"), 0);
    drag(item("Notes"), item("FAQ"), 20);
    expect(allowDrop).toHaveBeenCalledWith(
      expect.objectContaining({
        dropPosition: 0,
        dropNode: expect.objectContaining({ value: "faq" }),
      }),
    );
    expect(onDrop).not.toHaveBeenCalled();
    drag(item("Notes"), item("FAQ"), 2);
    expect(onDrop).toHaveBeenCalledTimes(1);
  });

  it("a disabled tree never drags", () => {
    render(<Tree aria-label="Docs" treeData={TREE} draggable disabled />);
    expect(item("FAQ")).not.toHaveAttribute("draggable");
  });
});

/** A consumer that applies the move — enough to prove focus follows the node. */
function applyMove(data: TreeNodeProp[], info: TreeDropInfoProp): TreeNodeProp[] {
  let moved: TreeNodeProp | undefined;
  const strip = (list: TreeNodeProp[]): TreeNodeProp[] =>
    list
      .filter((node) => {
        if (node.value === info.dragNode.value) {
          moved = node;
          return false;
        }
        return true;
      })
      .map((node) => (node.children ? { ...node, children: strip(node.children) } : node));
  const insert = (list: TreeNodeProp[]): TreeNodeProp[] =>
    list.flatMap((node) => {
      if (node.value === info.node.value) {
        if (info.dropPosition === 0)
          return [{ ...node, children: [...(node.children ?? []), moved!] }];
        return info.dropPosition === -1 ? [moved!, node] : [node, moved!];
      }
      return node.children ? [{ ...node, children: insert(node.children) }] : [node];
    });
  const rest = strip(data);
  return insert(rest);
}

function MovableTree({ onDrop }: { onDrop: (info: TreeDropInfoProp) => void }) {
  const [data, setData] = React.useState(TREE);
  return (
    <Tree
      aria-label="Docs"
      treeData={data}
      draggable
      defaultExpandAll
      onDrop={(info) => {
        onDrop(info);
        setData((current) => applyMove(current, info));
      }}
    />
  );
}

describe("Tree draggable — keyboard (gh#1093, WCAG 2.5.7)", () => {
  it("Alt+↑ / Alt+↓ move past a sibling, Alt+← outdents, Alt+→ indents", async () => {
    const user = userEvent.setup();
    const onDrop = vi.fn();
    renderEn(<MovableTree onDrop={onDrop} />);

    act(() => item("Setup").focus());
    await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await user.keyboard("{Alt>}{ArrowLeft}{/Alt}");
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");

    expect(onDrop.mock.calls.map(([info]) => names(info))).toEqual([
      { dragNode: "setup", node: "intro", dropPosition: -1, dropToGap: true },
      { dragNode: "setup", node: "guide", dropPosition: 1, dropToGap: true },
      { dragNode: "setup", node: "faq", dropPosition: 1, dropToGap: true },
      // FAQ has no children yet, so indent files Setup INSIDE it.
      { dragNode: "setup", node: "faq", dropPosition: 0, dropToGap: false },
    ]);
    // Focus follows the moved node, which is now visible under its new (opened) parent.
    expect(document.activeElement).toBe(item("Setup"));
    expect(item("Setup")).toHaveAttribute("aria-level", "2");
    expect(item("FAQ")).toHaveAttribute("aria-expanded", "true");
  });

  it("indents after the previous sibling's last child when it has children", async () => {
    const user = userEvent.setup();
    const onDrop = vi.fn();
    renderEn(<MovableTree onDrop={onDrop} />);
    act(() => item("FAQ").focus());
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(names(onDrop.mock.calls[0][0])).toEqual({
      dragNode: "faq",
      node: "setup",
      dropPosition: 1,
      dropToGap: true,
    });
  });

  it("announces each move and each refusal in a live region", async () => {
    const user = userEvent.setup();
    renderEn(<MovableTree onDrop={() => {}} />);
    const live = screen.getAllByRole("status").find((node) => node.getAttribute("aria-live"))!;
    act(() => item("Setup").focus());
    await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
    expect(live).toHaveTextContent("Setup moved before Intro");
    // Setup is now Guide's first child: there is nothing above it to move past.
    await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
    expect(live).toHaveTextContent("Setup cannot move there");
  });

  it("describes the keyboard moves on the tree, and plain arrows still navigate", async () => {
    const user = userEvent.setup();
    const onDrop = vi.fn();
    renderEn(<MovableTree onDrop={onDrop} />);
    const tree = screen.getByRole("tree");
    expect(tree).toHaveAccessibleDescription(/Alt plus arrow keys/);
    act(() => item("Guide").focus());
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(item("Intro"));
    expect(onDrop).not.toHaveBeenCalled();
  });
});
