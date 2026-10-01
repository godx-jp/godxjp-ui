import * as React from "react";
import { mergeRefs } from "@react-aria/utils";
import { ChevronDown, ChevronRight, File as FileIcon, Folder, FolderOpen } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { CheckboxVisual } from "../data-entry/checkbox";
import { Skeleton } from "../feedback/skeleton";
import {
  collectAllExpandableKeys,
  createLazyLoadLedger,
  flattenVisibleTree,
  getDescendantValues,
  normalizeTreeOptions,
  reactNodeText,
  type NormalizedTreeOption,
} from "../../lib/tree";
import type {
  TreeDropPositionProp,
  TreeNodeProp,
  TreeProp,
} from "../../props/components/data-display.prop";

export type {
  TreeAllowDropInfoProp,
  TreeDropInfoProp,
  TreeDropPositionProp,
  TreeNodeProp,
  TreeProp,
  TreeProp as TreeProps,
} from "../../props/components/data-display.prop";

type CheckState = "checked" | "unchecked" | "indeterminate";

function toArray(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/** A node the user is allowed to tick. Disabled leaves never count toward a parent's denominator. */
function isTickable(node: NormalizedTreeOption): boolean {
  return !node.disabled && !node.disableCheckbox;
}

/**
 * Rebuild the checked set so it can never LIE about a branch.
 *
 * Cascading a check downward is only half the contract: tick a parent, then untick one child, and
 * a set that still carries the parent's own value renders "all selected" over a partial selection
 * (interaction-feel §1 — a "dead" or half-true affordance is a bug). So the set is derived bottom
 * up every time: a branch is checked IFF every tickable child is, and nothing else survives.
 */
function normalizeCheckedValues(
  nodes: NormalizedTreeOption[],
  source: ReadonlySet<string>,
  out: Set<string> = new Set(),
): Set<string> {
  for (const node of nodes) {
    const children = node.children ?? [];
    if (children.length === 0) {
      if (source.has(node.value)) out.add(node.value);
      continue;
    }
    normalizeCheckedValues(children, source, out);
    const tickable = children.filter(isTickable);
    const allOn = tickable.length > 0 && tickable.every((child) => out.has(child.value));
    // A branch whose every child is locked has no children to aggregate — it stands alone.
    if (allOn || (tickable.length === 0 && source.has(node.value))) out.add(node.value);
  }
  return out;
}

function indexTree(
  nodes: NormalizedTreeOption[],
  into: Map<string, NormalizedTreeOption> = new Map(),
): Map<string, NormalizedTreeOption> {
  for (const node of nodes) {
    into.set(node.value, node);
    if (node.children?.length) indexTree(node.children, into);
  }
  return into;
}

/**
 * Direction at the NODE, not at the document. A tree can sit inside an RTL region of an LTR page
 * (a bilingual admin), and `→` must mean "into the children" for the region the user is reading.
 */
function isRtl(element: HTMLElement): boolean {
  return element.closest("[dir]")?.getAttribute("dir")?.toLowerCase() === "rtl";
}

/** Rows rendered beyond each edge of the viewport while windowed, so a fast scroll never flashes. */
const VIRTUAL_OVERSCAN = 6;

/** One line of the FLAT (windowed) outline: a node row, or the placeholder of a loading branch. */
type FlatRow =
  | { kind: "node"; node: NormalizedTreeOption; depth: number; setSize: number; posInSet: number }
  | { kind: "loading"; key: string; depth: number };

/**
 * Tree — the WAI-ARIA APG "Tree View", on a page.
 *
 * `TreeSelect` is this hierarchy inside a Popover; `Tree` is the outline view itself — expandable,
 * roving-tabindex focusable, arrow-navigable, optionally checkable. An indented list that only
 * LOOKS like a tree is not one (that was `TreeList`, removed in 21.0.0): reach for `Tree` whenever
 * nodes expand, collapse, or are navigated by keyboard. The traversal model is shared with `TreeSelect`
 * (`src/lib/tree.ts`), so a page tree and a dropdown tree can never disagree about what "expanded",
 * "a leaf" or "every descendant" means.
 */
function TreeRoot({
  treeData,
  fieldNames,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  checkable: checkableProp = false,
  checkStrictly = false,
  checkedValues,
  defaultCheckedValues,
  onCheckedValuesChange,
  expandedValues,
  defaultExpandedValues,
  onExpandedValuesChange,
  defaultExpandAll = false,
  loadData,
  titleRender,
  filterTreeNode,
  height,
  virtual = true,
  showLine = false,
  showIcon = false,
  divided = false,
  draggable = false,
  allowDrag,
  allowDrop,
  onDrop,
  variant = "default",
  size = "md",
  disabled = false,
  className,
  id,
  forwardedRef,
  ...ariaProps
}: TreeProp & { forwardedRef?: React.Ref<HTMLDivElement> }) {
  const { t } = useTranslation();
  const reactId = React.useId();
  const treeId = id ?? `${reactId}-tree`;
  const dragHintId = `${treeId}-drag-hint`;

  const options = React.useMemo(
    () => normalizeTreeOptions(treeData as unknown as Record<string, unknown>[], fieldNames),
    [treeData, fieldNames],
  );
  const nodeIndex = React.useMemo(() => indexTree(options), [options]);

  // ── expansion (antd expandedKeys / defaultExpandedKeys / onExpand) ────────────────────────
  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(() => {
    if (defaultExpandedValues) return [...defaultExpandedValues];
    return defaultExpandAll ? collectAllExpandableKeys(options) : [];
  });
  const isExpandedControlled = expandedValues !== undefined;
  const expanded = isExpandedControlled ? [...expandedValues] : internalExpanded;
  /* Memoised on the CONTENT, not the array identity: `expanded` is rebuilt every render (a spread
   * when controlled, state when not), so a set derived from it plainly would make every effect that
   * depends on it run every render. The join is the stable key. */
  const expandedKey = expanded.join("\u0000");
  const expandedSet = React.useMemo(
    () => new Set(expandedKey ? expandedKey.split("\u0000") : []),
    [expandedKey],
  );
  const commitExpanded = (next: string[]) => {
    if (!isExpandedControlled) setInternalExpanded(next);
    onExpandedValuesChange?.(next);
  };

  // ── selection (the controlled triad) ──────────────────────────────────────────────────────
  const isValueControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string[]>(() => toArray(defaultValue));
  const selected = isValueControlled ? toArray(value) : internalValue;
  const commitValue = (next: string[]) => {
    if (!isValueControlled) setInternalValue(next);
    onValueChange?.(multiple ? next : next[0]);
  };

  // ── checks (a SEPARATE axis from selection, exactly as in antd) ───────────────────────────
  const isCheckedControlled = checkedValues !== undefined;
  const [internalChecked, setInternalChecked] = React.useState<string[]>(() =>
    defaultCheckedValues ? [...defaultCheckedValues] : [],
  );
  const checked = isCheckedControlled ? [...checkedValues] : internalChecked;
  const checkedSet = checkStrictly
    ? new Set(checked)
    : normalizeCheckedValues(options, new Set(checked));
  const commitChecked = (next: string[]) => {
    const settled = checkStrictly ? next : [...normalizeCheckedValues(options, new Set(next))];
    if (!isCheckedControlled) setInternalChecked(settled);
    onCheckedValuesChange?.(settled);
  };

  // ── async children (antd loadData) — fires ONCE per node that LOADED ───────────────────────
  /* A rejected load is not a load (gh#1041). The old ledger recorded the node before the promise
   * settled and never cleared it, so one failed request left the branch unloadable for the life of
   * the tree. Now, exactly as rc-tree's `onNodeLoad`/`onNodeExpand`: on reject the node leaves the
   * loading set, is NOT marked loaded, and an UNCONTROLLED branch folds back shut (without firing
   * `onExpandedValuesChange`, as rc-tree's `setExpandedKeys` does not fire `onExpand`) — so the next
   * expand asks again, up to `MAX_LAZY_LOAD_RETRIES`. */
  const [lazyLoads] = React.useState(createLazyLoadLedger);
  /** Branches whose expansion the controlled-prop effect below has already answered. */
  const loadedFor = React.useRef<Set<string>>(new Set());
  const [loadingValues, setLoadingValues] = React.useState<Set<string>>(() => new Set());
  const requestLoad = (node: NormalizedTreeOption) => {
    if (!loadData) return;
    if ((node.children?.length ?? 0) > 0 || node.isLeaf === true) return;
    const started = lazyLoads.run(
      node.value,
      () => loadData(node as TreeNodeProp),
      (ok) => {
        setLoadingValues((prev) => {
          const next = new Set(prev);
          next.delete(node.value);
          return next;
        });
        if (ok) return;
        // A controlled tree that still holds the branch open re-asks on its next expansion.
        loadedFor.current.delete(node.value);
        if (!isExpandedControlled) {
          setInternalExpanded((prev) => prev.filter((entry) => entry !== node.value));
        }
      },
    );
    if (started) setLoadingValues((prev) => new Set(prev).add(node.value));
  };

  /* LAZY CHILDREN FOR A BRANCH THE CONSUMER OPENED, not just one the tree opened itself (gh#910).
   * `requestLoad` had exactly one caller — `expandNode`, the tree's own path — so a branch that
   * became expanded through the CONTROLLED `expandedValues` prop rendered open and never asked for
   * its children: open, empty, and staying that way. `expandedValues` is a documented controlled
   * prop, so driving it from outside is a supported thing to do, and it silently skipped the load.
   *
   * It also covers `defaultExpandAll` on a lazy tree, which seeds the expanded set without going
   * through `expandNode` and had the same hole.
   *
   * `requestLoad` is idempotent per node (the lazy-load ledger), so this cannot double-fetch a
   * branch the tree itself just opened. */
  /* Read through a ref rather than silencing the exhaustive-deps rule: `requestLoad` closes over
   * `loadData` and two setters and is re-made every render, so listing it would re-run this on
   * every render, and disabling the rule would hide the next dependency somebody forgets. */
  const requestLoadRef = React.useRef(requestLoad);
  requestLoadRef.current = requestLoad;

  const nodesByValue = React.useMemo(() => {
    const map = new Map<string, NormalizedTreeOption>();
    const walk = (list: readonly NormalizedTreeOption[]) => {
      for (const node of list) {
        map.set(node.value, node);
        if (node.children?.length) walk(node.children);
      }
    };
    walk(options);
    return map;
  }, [options]);
  React.useEffect(() => {
    if (!loadData) return;
    for (const value of expandedSet) {
      if (loadedFor.current.has(value)) continue;
      loadedFor.current.add(value);
      const node = nodesByValue.get(value);
      if (node) requestLoadRef.current(node);
    }
  }, [expandedSet, loadData, nodesByValue, requestLoadRef]);

  // ── drag-and-drop (antd draggable / allowDrop / onDrop, gh#1093) ──────────────────────────
  /* The tree REPORTS a move and never performs it: `treeData` belongs to the consumer, who
   * persists the move and hands the new hierarchy back, exactly as antd's demos do. */
  const parentOf = React.useMemo(() => {
    const map = new Map<string, NormalizedTreeOption | null>();
    const walk = (list: readonly NormalizedTreeOption[], parent: NormalizedTreeOption | null) => {
      for (const node of list) {
        map.set(node.value, parent);
        if (node.children?.length) walk(node.children, node);
      }
    };
    walk(options, null);
    return map;
  }, [options]);
  const isDraggable = draggable && !disabled;
  const canDrag = (node: NormalizedTreeOption) =>
    isDraggable && !node.disabled && (allowDrag ? allowDrag(node as TreeNodeProp) : true);
  /** A node may never land inside itself or its own subtree — that would cut it off the tree. */
  const canDrop = (
    dragNode: NormalizedTreeOption,
    dropNode: NormalizedTreeOption,
    dropPosition: TreeDropPositionProp,
  ) => {
    for (let cursor: NormalizedTreeOption | null | undefined = dropNode; cursor;) {
      if (cursor.value === dragNode.value) return false;
      cursor = parentOf.get(cursor.value);
    }
    return allowDrop
      ? allowDrop({
          dragNode: dragNode as TreeNodeProp,
          dropNode: dropNode as TreeNodeProp,
          dropPosition,
        })
      : true;
  };
  const [dragValue, setDragValue] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<{
    value: string;
    position: TreeDropPositionProp;
  } | null>(null);
  const [moveAnnouncement, setMoveAnnouncement] = React.useState("");
  const commitDrop = (
    dragNode: NormalizedTreeOption,
    dropNode: NormalizedTreeOption,
    dropPosition: TreeDropPositionProp,
  ) => {
    onDrop?.({
      dragNode: dragNode as TreeNodeProp,
      node: dropNode as TreeNodeProp,
      dropPosition,
      dropToGap: dropPosition !== 0,
    });
    const key =
      dropPosition === -1
        ? "dataDisplay.tree.movedBefore"
        : dropPosition === 1
          ? "dataDisplay.tree.movedAfter"
          : "dataDisplay.tree.movedInside";
    setMoveAnnouncement(
      t(key, { node: reactNodeText(dragNode.label), target: reactNodeText(dropNode.label) }),
    );
  };
  /** Upper quarter → before, lower quarter → after, the middle → inside (rc-tree's offsets). */
  const dropPositionAt = (event: React.DragEvent<HTMLDivElement>): TreeDropPositionProp => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.height <= 0) return 0;
    const offset = (event.clientY - rect.top) / rect.height;
    if (offset < 0.25) return -1;
    if (offset > 0.75) return 1;
    return 0;
  };
  const clearDrag = () => {
    setDragValue(null);
    setDropTarget(null);
  };
  /** The keyboard equivalent of a drag (WCAG 2.5.7): Alt+arrows, resolved to the same drop info. */
  const keyboardMove = (node: NormalizedTreeOption, direction: "up" | "down" | "out" | "in") => {
    const parent = parentOf.get(node.value) ?? null;
    const siblings = parent ? (parent.children ?? []) : options;
    const position = siblings.findIndex((entry) => entry.value === node.value);
    let target: NormalizedTreeOption | null | undefined;
    let dropPosition: TreeDropPositionProp;
    if (direction === "up") {
      target = siblings[position - 1];
      dropPosition = -1;
    } else if (direction === "down") {
      target = siblings[position + 1];
      dropPosition = 1;
    } else if (direction === "out") {
      target = parent;
      dropPosition = 1;
    } else {
      const previous = siblings[position - 1];
      const lastChild = previous?.children?.[previous.children.length - 1];
      // Indent = become the LAST child of the previous sibling: after its last child, or inside
      // it when it has none yet.
      target = lastChild ?? previous;
      dropPosition = lastChild ? 1 : 0;
    }
    if (!target || !canDrag(node) || !canDrop(node, target, dropPosition)) {
      setMoveAnnouncement(t("dataDisplay.tree.moveRefused", { node: reactNodeText(node.label) }));
      return;
    }
    if (direction === "in") {
      const host = dropPosition === 0 ? target : siblings[position - 1];
      // Open the new parent so the moved node (and focus) stays visible.
      if (host && !expandedSet.has(host.value)) commitExpanded([...expanded, host.value]);
    }
    commitDrop(node, target, dropPosition);
    setActiveValue(node.value);
    pendingFocus.current = node.value;
  };

  // The keyboard's world: every node the user can actually see, in reading order.
  const visible = flattenVisibleTree(options, expandedSet);
  const visibleIndex = new Map(visible.map((entry, index) => [entry.node.value, index]));

  // ── roving tabindex: EXACTLY one node is in the tab ring ──────────────────────────────────
  const [activeValue, setActiveValue] = React.useState<string | null>(null);
  const rovingValue =
    (activeValue && visibleIndex.has(activeValue) ? activeValue : null) ??
    visible.find((entry) => selected.includes(entry.node.value))?.node.value ??
    visible[0]?.node.value ??
    null;

  // ── windowing (antd `height` + `virtual`, gh#1042) ───────────────────────────────────────
  /* With `height`, the tree is its own scroll viewport; unless `virtual={false}` it also renders
   * the rows in view only — rc-tree's answer to a long child list (it has no "load more" node).
   * The row height is MEASURED off the first rendered row, never assumed: it follows the `size`
   * tier and the density. Until it is known (first paint, or a DOM with no layout) every row
   * renders, so the window can only ever show more than it must, never less. */
  const isWindowed = height !== undefined && virtual;
  const treeRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [rowHeight, setRowHeight] = React.useState(0);
  const [hasFocusWithin, setHasFocusWithin] = React.useState(false);
  React.useLayoutEffect(() => {
    if (!isWindowed) return;
    const firstRow = treeRef.current?.querySelector<HTMLElement>('[role="treeitem"]');
    const measured = firstRow?.offsetHeight ?? 0;
    if (measured > 0 && measured !== rowHeight) setRowHeight(measured);
    // Re-measured when the tier (`size`) changes or rows first arrive (a lazy root).
  }, [isWindowed, rowHeight, size, visible.length]);

  const nodeRefs = React.useRef(new Map<string, HTMLDivElement | null>());
  // Focus is moved only for a move the KEYBOARD asked for — a bare re-render must never steal it.
  const pendingFocus = React.useRef<string | null>(null);
  React.useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    nodeRefs.current.get(target)?.focus();
  });
  /** Scroll a windowed tree so the row is inside the viewport BEFORE it is focused. */
  const revealRow = (value: string) => {
    const element = treeRef.current;
    const rowIndex = rowIndexOf.get(value);
    if (!isWindowed || !element || rowHeight <= 0 || rowIndex === undefined) return;
    const viewport = element.clientHeight || height || 0;
    const top = rowIndex * rowHeight;
    let next = element.scrollTop;
    if (top < next) next = top;
    else if (top + rowHeight > next + viewport) next = top + rowHeight - viewport;
    if (next === element.scrollTop) return;
    element.scrollTop = next;
    setScrollTop(next);
  };
  const moveTo = (index: number) => {
    const entry = visible[index];
    if (!entry) return;
    revealRow(entry.node.value);
    setActiveValue(entry.node.value);
    pendingFocus.current = entry.node.value;
  };

  const expandableOf = (node: NormalizedTreeOption) =>
    ((node.children?.length ?? 0) > 0 && node.isLeaf !== true) ||
    Boolean(loadData && node.isLeaf === false && !node.children?.length);

  const expandNode = (node: NormalizedTreeOption) => {
    if (disabled || expandedSet.has(node.value)) return;
    requestLoad(node);
    commitExpanded([...expanded, node.value]);
  };
  const collapseNode = (node: NormalizedTreeOption) => {
    if (disabled) return;
    commitExpanded(expanded.filter((entry) => entry !== node.value));
  };
  const toggleExpand = (node: NormalizedTreeOption) => {
    if (expandedSet.has(node.value)) collapseNode(node);
    else expandNode(node);
  };

  const checkStateOf = (node: NormalizedTreeOption): CheckState => {
    const children = node.children ?? [];
    if (checkStrictly || children.length === 0) {
      return checkedSet.has(node.value) ? "checked" : "unchecked";
    }
    if (checkedSet.has(node.value)) return "checked";
    const descendants = getDescendantValues(node).slice(1);
    return descendants.some((entry) => checkedSet.has(entry)) ? "indeterminate" : "unchecked";
  };

  const toggleCheck = (node: NormalizedTreeOption) => {
    if (disabled || node.disabled || node.disableCheckbox) return;
    const isOn = checkStateOf(node) === "checked";
    if (checkStrictly) {
      commitChecked(
        isOn ? checked.filter((entry) => entry !== node.value) : [...checked, node.value],
      );
      return;
    }
    const related = getDescendantValues(node).filter((entry) => {
      const target = nodeIndex.get(entry);
      return target ? isTickable(target) : false;
    });
    commitChecked(
      isOn
        ? checked.filter((entry) => !related.includes(entry))
        : [...new Set([...checked, ...related])],
    );
  };

  const select = (node: NormalizedTreeOption) => {
    if (disabled || node.disabled) return;
    const isOn = selected.includes(node.value);
    if (multiple) {
      commitValue(
        isOn ? selected.filter((entry) => entry !== node.value) : [...selected, node.value],
      );
      return;
    }
    commitValue(isOn ? [] : [node.value]);
  };

  /** Enter/Space ticks the box when the tree is checkable, and selects otherwise (APG). */
  const activate = (node: NormalizedTreeOption) => {
    if (checkableProp) toggleCheck(node);
    else select(node);
  };

  // ── type-ahead: jump to the next node whose label starts with what was typed ──────────────
  const typeAhead = React.useRef({ buffer: "", at: 0 });
  const jumpByLabel = (key: string, from: number) => {
    const now = Date.now();
    const state = typeAhead.current;
    state.buffer = now - state.at > 800 ? key : state.buffer + key;
    state.at = now;
    const needle = state.buffer.toLowerCase();
    for (let step = 1; step <= visible.length; step += 1) {
      const index = (from + step) % visible.length;
      if (reactNodeText(visible[index].node.label).toLowerCase().startsWith(needle)) {
        moveTo(index);
        return;
      }
    }
  };

  const siblingIndexes = (index: number, depth: number): number[] => {
    const out: number[] = [];
    for (let i = index; i >= 0; i -= 1) {
      if (visible[i].depth < depth) break;
      if (visible[i].depth === depth) out.unshift(i);
    }
    for (let i = index + 1; i < visible.length; i += 1) {
      if (visible[i].depth < depth) break;
      if (visible[i].depth === depth) out.push(i);
    }
    return out;
  };

  const onNodeKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    node: NormalizedTreeOption,
  ) => {
    const index = visibleIndex.get(node.value);
    if (index === undefined) return;
    const depth = visible[index].depth;
    const expandable = expandableOf(node);
    const isOpen = expandable && expandedSet.has(node.value);
    const rtl = isRtl(event.currentTarget);
    const inward = rtl ? "ArrowLeft" : "ArrowRight";
    const outward = rtl ? "ArrowRight" : "ArrowLeft";

    if (
      isDraggable &&
      event.altKey &&
      (event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === inward ||
        event.key === outward)
    ) {
      event.preventDefault();
      keyboardMove(
        node,
        event.key === "ArrowUp"
          ? "up"
          : event.key === "ArrowDown"
            ? "down"
            : event.key === inward
              ? "in"
              : "out",
      );
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveTo(index + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveTo(index - 1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      moveTo(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      moveTo(visible.length - 1);
      return;
    }
    if (event.key === inward) {
      event.preventDefault();
      if (expandable && !isOpen) expandNode(node);
      else if (isOpen) moveTo(index + 1);
      return;
    }
    if (event.key === outward) {
      event.preventDefault();
      if (isOpen) {
        collapseNode(node);
        return;
      }
      for (let i = index - 1; i >= 0; i -= 1) {
        if (visible[i].depth < depth) {
          moveTo(i);
          return;
        }
      }
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate(node);
      return;
    }
    if (event.key === "*") {
      event.preventDefault();
      const siblings = siblingIndexes(index, depth)
        .map((i) => visible[i].node)
        .filter((sibling) => expandableOf(sibling));
      siblings.forEach(requestLoad);
      commitExpanded([...new Set([...expanded, ...siblings.map((sibling) => sibling.value)])]);
      return;
    }
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      jumpByLabel(event.key, index);
    }
  };

  /** One `treeitem` row. `groupId` is set only in the nested layout, where the row owns its group. */
  const renderItem = (
    node: NormalizedTreeOption,
    depth: number,
    setSize: number,
    posInSet: number,
    groupId: string | undefined,
  ): React.ReactNode => {
    const hasChildren = (node.children?.length ?? 0) > 0 && node.isLeaf !== true;
    const expandable = expandableOf(node);
    const isOpen = expandable && expandedSet.has(node.value);
    const isLoading = loadingValues.has(node.value);
    const isSelected = selected.includes(node.value);
    const isFilterMatch = filterTreeNode ? filterTreeNode(node as TreeNodeProp) : false;
    const checkState = checkableProp ? checkStateOf(node) : "unchecked";
    const nodeDisabled = disabled || Boolean(node.disabled);
    const labelId = `${treeId}-${node.value}-label`;
    const nodeDraggable = canDrag(node);
    const dropHere = dropTarget?.value === node.value ? dropTarget.position : undefined;
    const glyph =
      node.icon ??
      (variant === "directory" ? (
        hasChildren ? (
          isOpen ? (
            <FolderOpen />
          ) : (
            <Folder />
          )
        ) : (
          <FileIcon />
        )
      ) : null);

    return (
      <div
        key={node.value}
        ref={(element) => {
          nodeRefs.current.set(node.value, element);
        }}
        role="treeitem"
        // Named by the LABEL alone, so the sr-only status text below stays a redundancy for the
        // eye's sake and never turns into part of the node's name.
        aria-labelledby={labelId}
        aria-level={depth + 1}
        aria-setsize={setSize}
        aria-posinset={posInSet}
        aria-selected={isSelected}
        // Only a node that HAS (or can load) children is expandable — APG forbids the attribute
        // on a leaf, where it would promise an affordance that does not exist.
        aria-expanded={expandable ? isOpen : undefined}
        aria-owns={groupId}
        aria-checked={
          checkableProp
            ? checkState === "indeterminate"
              ? "mixed"
              : checkState === "checked"
            : undefined
        }
        aria-disabled={nodeDisabled || undefined}
        aria-busy={isLoading || undefined}
        tabIndex={rovingValue === node.value ? 0 : -1}
        onFocus={() => setActiveValue(node.value)}
        onKeyDown={(event) => onNodeKeyDown(event, node)}
        onClick={() => {
          if (nodeDisabled) return;
          select(node);
        }}
        /* THE NODE'S OWN VALUE, PUBLISHED (gh#910). A row already announces its level, position
         * and expanded state, and said nothing about WHICH node it is — so a consumer who wanted
         * to bind a key of their own had to map `document.activeElement` back to a node through
         * the internal label id, which is exactly the fragile thing gh#910 reported doing.
         *
         * This is the escape hatch instead of a `spaceAction` prop: the library keeps the APG
         * key map (`→`/`←` move the hierarchy, Enter/Space activate) and a consumer who wants a
         * different binding can read the focused row's value off the DOM and drive
         * `expandedValues` themselves, with no private markup and no second key language shipped
         * to everyone. */
        data-value={node.value}
        data-selected={isSelected ? "true" : undefined}
        data-disabled={nodeDisabled ? "" : undefined}
        // antd's `filter-node` class (rc-tree TreeNode), in this package's data-attribute form.
        data-filter-node={isFilterMatch ? "true" : undefined}
        draggable={nodeDraggable || undefined}
        data-dragging={dragValue === node.value ? "true" : undefined}
        data-drop-position={
          dropHere === undefined
            ? undefined
            : dropHere === -1
              ? "before"
              : dropHere === 1
                ? "after"
                : "inside"
        }
        onDragStart={
          isDraggable
            ? (event) => {
                if (!nodeDraggable) {
                  event.preventDefault();
                  return;
                }
                event.dataTransfer.effectAllowed = "move";
                // Firefox starts no drag without data.
                event.dataTransfer.setData("text/plain", node.value);
                setDragValue(node.value);
              }
            : undefined
        }
        onDragOver={
          isDraggable
            ? (event) => {
                const dragged = dragValue === null ? undefined : nodesByValue.get(dragValue);
                if (!dragged) return;
                const position = dropPositionAt(event);
                if (!canDrop(dragged, node, position)) {
                  if (dropTarget) setDropTarget(null);
                  return;
                }
                // Cancelling dragover is what tells the browser this row accepts the drop.
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                if (dropTarget?.value !== node.value || dropTarget.position !== position) {
                  setDropTarget({ value: node.value, position });
                }
              }
            : undefined
        }
        onDragLeave={
          isDraggable
            ? (event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                if (dropTarget?.value === node.value) setDropTarget(null);
              }
            : undefined
        }
        onDrop={
          isDraggable
            ? (event) => {
                event.preventDefault();
                const dragged = dragValue === null ? undefined : nodesByValue.get(dragValue);
                const position = dropPositionAt(event);
                if (dragged && canDrop(dragged, node, position)) {
                  commitDrop(dragged, node, position);
                }
                clearDrag();
              }
            : undefined
        }
        onDragEnd={isDraggable ? clearDrag : undefined}
        className="ui-tree-node ui-focus-ring"
        style={{ "--tree-node-level": depth } as React.CSSProperties}
      >
        {/* Windowed rows have no `role="group"` to hang the `showLine` rail off, so each row draws
            its own ancestors' rails — rc-tree's indent units, one per level above the row. */}
        {isWindowed && showLine
          ? Array.from({ length: depth }, (_, level) => (
              <span
                key={`rail-${level}`}
                aria-hidden="true"
                className="ui-tree-rail"
                style={{ "--tree-rail-level": level + 1 } as React.CSSProperties}
              />
            ))
          : null}
        {/* The disclosure triangle and the tick box are DECORATIVE glyphs, never nested controls:
            a `<button>` or a real checkbox inside a tree item breaks the one-tab-stop rule and
            the keyboard semantics with it. Their state rides on aria-expanded / aria-checked
            above. @see godxjp-ui-interaction-feel §8. */}
        <span
          aria-hidden="true"
          data-leaf={expandable ? undefined : ""}
          className="ui-tree-switcher"
          title={
            expandable
              ? isOpen
                ? t("dataDisplay.tree.collapse")
                : t("dataDisplay.tree.expand")
              : undefined
          }
          onClick={(event) => {
            event.stopPropagation();
            if (nodeDisabled || !expandable) return;
            toggleExpand(node);
          }}
        >
          {expandable ? isOpen ? <ChevronDown /> : <ChevronRight /> : null}
        </span>
        {checkableProp ? (
          <span
            className="ui-tree-check"
            onClick={(event) => {
              event.stopPropagation();
              toggleCheck(node);
            }}
          >
            <CheckboxVisual
              checked={checkState === "checked"}
              indeterminate={checkState === "indeterminate"}
              disabled={nodeDisabled || Boolean(node.disableCheckbox)}
            />
          </span>
        ) : null}
        {showIcon && glyph ? (
          <span aria-hidden="true" className="ui-tree-icon">
            {glyph}
          </span>
        ) : null}
        <span id={labelId} className="ui-tree-label">
          {titleRender ? titleRender(node as TreeNodeProp) : node.label}
        </span>
        {/* Selection is never colour alone (WCAG 1.4.1) — the state is also words. */}
        {isSelected ? <span className="sr-only">{t("dataDisplay.tree.selected")}</span> : null}
        {/* Neither is a filter match: the weight is the second cue, these words the third. */}
        {isFilterMatch ? (
          <span className="sr-only">{t("dataDisplay.tree.filterMatch")}</span>
        ) : null}
      </div>
    );
  };

  /**
   * Each node renders as TWO siblings: the `treeitem` row, then — while it is open — its
   * `role="group"`.
   *
   * The row IS the tree item, so it is the one tab stop, the one focus ring, and the one hit area;
   * nothing focusable lives inside it (APG: a tree item owns exactly one tab stop). Ownership of
   * the child group is stated explicitly with `aria-owns` rather than by DOM containment, which is
   * what keeps the item's box — and therefore its focus ring and its selected band — the height of
   * ONE row instead of the height of its whole subtree.
   */
  const renderNodes = (nodes: NormalizedTreeOption[], depth: number): React.ReactNode[] =>
    nodes.flatMap((node, position) => {
      const hasChildren = (node.children?.length ?? 0) > 0 && node.isLeaf !== true;
      const isOpen = expandableOf(node) && expandedSet.has(node.value);
      const isLoading = loadingValues.has(node.value);
      const groupId = `${treeId}-${node.value}-group`;
      const showGroup = isOpen && (hasChildren || isLoading);
      const item = renderItem(
        node,
        depth,
        nodes.length,
        position + 1,
        showGroup ? groupId : undefined,
      );

      if (!showGroup) return [item];
      return [
        item,
        <div
          key={`${node.value}::group`}
          id={groupId}
          role="group"
          className="ui-tree-group"
          style={{ "--tree-node-level": depth + 1 } as React.CSSProperties}
        >
          {hasChildren ? (
            renderNodes(node.children!, depth + 1)
          ) : (
            <div
              className="ui-tree-loading"
              style={{ "--tree-node-level": depth + 1 } as React.CSSProperties}
            >
              <Skeleton className="ui-tree-loading-bar" />
              <span className="sr-only">{t("dataDisplay.tree.loading")}</span>
            </div>
          )}
        </div>,
      ];
    });

  /* THE FLAT OUTLINE, for the windowed layout. A window of a nested DOM cannot be cut, so the
   * windowed tree is a flat run of `treeitem`s — the shape APG documents for a tree whose nodes
   * are not all in the DOM: hierarchy rides on `aria-level`, position on `aria-setsize` /
   * `aria-posinset`, both computed from the DATA, never from what happens to be rendered. */
  const flatRows: FlatRow[] = [];
  if (isWindowed) {
    const walk = (nodes: NormalizedTreeOption[], depth: number) => {
      nodes.forEach((node, position) => {
        flatRows.push({
          kind: "node",
          node,
          depth,
          setSize: nodes.length,
          posInSet: position + 1,
        });
        if (!expandableOf(node) || !expandedSet.has(node.value)) return;
        if ((node.children?.length ?? 0) > 0 && node.isLeaf !== true)
          walk(node.children!, depth + 1);
        else if (loadingValues.has(node.value)) {
          flatRows.push({ kind: "loading", key: `${node.value}::loading`, depth: depth + 1 });
        }
      });
    };
    walk(options, 0);
  }
  const rowIndexOf = new Map<string, number>();
  flatRows.forEach((row, index) => {
    if (row.kind === "node") rowIndexOf.set(row.node.value, index);
  });

  let windowStart = 0;
  let windowEnd = flatRows.length;
  if (isWindowed && rowHeight > 0 && height !== undefined) {
    const first = Math.floor(scrollTop / rowHeight);
    windowStart = Math.max(0, first - VIRTUAL_OVERSCAN);
    windowEnd = Math.min(flatRows.length, first + Math.ceil(height / rowHeight) + VIRTUAL_OVERSCAN);
    /* The row holding focus is never unmounted from under it: a wheel-scroll away from a focused
     * row would otherwise drop focus to <body> and throw the keyboard user out of the tree. */
    const focusedRow = rovingValue === null ? undefined : rowIndexOf.get(rovingValue);
    if (hasFocusWithin && focusedRow !== undefined) {
      windowStart = Math.min(windowStart, focusedRow);
      windowEnd = Math.max(windowEnd, focusedRow + 1);
    }
  }
  const rovingRow = rovingValue === null ? undefined : rowIndexOf.get(rovingValue);
  /* The one tab stop scrolled out of the window: the tree itself takes Tab and hands focus
   * straight to that row, so Tab never skips a tree whose active node is off-screen. */
  const rovingOffscreen =
    isWindowed && rovingRow !== undefined && (rovingRow < windowStart || rovingRow >= windowEnd);

  const isEmpty = visible.length === 0;

  const body = isEmpty
    ? null
    : isWindowed
      ? flatRows.slice(windowStart, windowEnd).map((row) =>
          row.kind === "node" ? (
            renderItem(row.node, row.depth, row.setSize, row.posInSet, undefined)
          ) : (
            // A windowed tree has no `group` to hold the placeholder, and `role="tree"` may own
            // only treeitems — so the skeleton is decoration and `aria-busy` on the row speaks.
            <div
              key={row.key}
              aria-hidden="true"
              className="ui-tree-loading"
              style={{ "--tree-node-level": row.depth } as React.CSSProperties}
            >
              <Skeleton className="ui-tree-loading-bar" />
            </div>
          ),
        )
      : renderNodes(options, 0);

  return (
    <>
      <div
        {...ariaProps}
        aria-describedby={
          isDraggable
            ? [ariaProps["aria-describedby"], dragHintId].filter(Boolean).join(" ")
            : ariaProps["aria-describedby"]
        }
        ref={mergeRefs(forwardedRef, treeRef)}
        id={treeId}
        role="tree"
        aria-multiselectable={multiple || checkableProp}
        aria-disabled={disabled || undefined}
        data-size={size}
        data-variant={variant}
        data-show-line={showLine ? "true" : undefined}
        data-divided={divided ? "true" : undefined}
        data-empty={isEmpty ? "true" : undefined}
        data-virtual={isWindowed ? "true" : undefined}
        className={cn("ui-tree", className)}
        tabIndex={rovingOffscreen ? 0 : undefined}
        style={
          height === undefined
            ? undefined
            : {
                maxBlockSize: height,
                overflowY: "auto",
              }
        }
        onScroll={isWindowed ? (event) => setScrollTop(event.currentTarget.scrollTop) : undefined}
        onFocus={(event) => {
          if (!isWindowed) return;
          setHasFocusWithin(true);
          if (event.target === event.currentTarget && rovingValue !== null) {
            revealRow(rovingValue);
            pendingFocus.current = rovingValue;
          }
        }}
        onBlur={(event) => {
          if (!isWindowed) return;
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setHasFocusWithin(false);
          }
        }}
      >
        {/* The rows outside the window are ROOM, not DOM: two empty spacers hold the scroll height.
            Not padding on the tree — under `border-box` a padding taller than `max-block-size`
            wins, and the viewport would grow to the whole outline. `aria-hidden` and empty, so
            the tree still owns nothing but treeitems. */}
        {isWindowed ? (
          <div
            aria-hidden="true"
            className="ui-tree-spacer"
            style={{ blockSize: windowStart * rowHeight }}
          />
        ) : null}
        {body}
        {isWindowed ? (
          <div
            aria-hidden="true"
            className="ui-tree-spacer"
            style={{ blockSize: (flatRows.length - windowEnd) * rowHeight }}
          />
        ) : null}
      </div>
      {/* OUTSIDE the tree, deliberately. `role="tree"` may own only `treeitem` and `group`, so a
          notice parked inside it is a disallowed child — axe says so, and a screen reader would
          be walking a tree whose one "node" is a paragraph. */}
      {/* The keyboard path of a draggable tree is described, and every move is spoken —
          outside the tree for the same reason as the empty notice below. */}
      {isDraggable ? (
        <>
          <span id={dragHintId} className="sr-only">
            {t("dataDisplay.tree.dragHint")}
          </span>
          <span role="status" aria-live="polite" className="sr-only">
            {moveAnnouncement}
          </span>
        </>
      ) : null}
      {isEmpty ? (
        <p role="status" className="ui-tree-empty">
          {t("dataDisplay.tree.empty")}
        </p>
      ) : null}
    </>
  );
}

/**
 * `ref` reaches the `role="tree"` container — the element a page scrolls to, measures, or
 * focus-manages. Every unknown prop (`aria-*`, `data-*`) rides `...ariaProps` onto the same node.
 */
export const Tree = React.forwardRef<HTMLDivElement, TreeProp>((props, ref) => (
  <TreeRoot {...props} forwardedRef={ref} />
));
Tree.displayName = "Tree";
