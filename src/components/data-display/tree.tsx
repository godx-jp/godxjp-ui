import * as React from "react";
import { ChevronDown, ChevronRight, File as FileIcon, Folder, FolderOpen } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { CheckboxVisual } from "../data-entry/checkbox";
import { Skeleton } from "../feedback/skeleton";
import {
  collectAllExpandableKeys,
  flattenVisibleTree,
  getDescendantValues,
  normalizeTreeOptions,
  reactNodeText,
  type NormalizedTreeOption,
} from "../../lib/tree";
import type { TreeNodeProp, TreeProp } from "../../props/components/data-display.prop";

export type {
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

/**
 * Tree — the WAI-ARIA APG "Tree View", on a page.
 *
 * `TreeSelect` is this hierarchy inside a Popover and `TreeList` is a flat indented list that only
 * LOOKS like one; `Tree` is the outline view itself — expandable, roving-tabindex focusable,
 * arrow-navigable, optionally checkable. The traversal model is shared with `TreeSelect`
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
  showLine = false,
  showIcon = false,
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
  const expandedSet = new Set(expanded);
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

  // ── async children (antd loadData) — fires ONCE per node, ever ────────────────────────────
  const requestedLoads = React.useRef(new Set<string>());
  const [loadingValues, setLoadingValues] = React.useState<Set<string>>(() => new Set());
  const requestLoad = (node: NormalizedTreeOption) => {
    if (!loadData) return;
    if ((node.children?.length ?? 0) > 0 || node.isLeaf === true) return;
    if (requestedLoads.current.has(node.value)) return;
    requestedLoads.current.add(node.value);
    setLoadingValues((prev) => new Set(prev).add(node.value));
    void Promise.resolve(loadData(node as TreeNodeProp)).finally(() => {
      setLoadingValues((prev) => {
        const next = new Set(prev);
        next.delete(node.value);
        return next;
      });
    });
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

  const nodeRefs = React.useRef(new Map<string, HTMLDivElement | null>());
  // Focus is moved only for a move the KEYBOARD asked for — a bare re-render must never steal it.
  const pendingFocus = React.useRef<string | null>(null);
  React.useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    nodeRefs.current.get(target)?.focus();
  });
  const moveTo = (index: number) => {
    const entry = visible[index];
    if (!entry) return;
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
      const expandable = expandableOf(node);
      const isOpen = expandable && expandedSet.has(node.value);
      const isLoading = loadingValues.has(node.value);
      const isSelected = selected.includes(node.value);
      const checkState = checkableProp ? checkStateOf(node) : "unchecked";
      const nodeDisabled = disabled || Boolean(node.disabled);
      const labelId = `${treeId}-${node.value}-label`;
      const groupId = `${treeId}-${node.value}-group`;
      const showGroup = isOpen && (hasChildren || isLoading);
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

      const item = (
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
          aria-setsize={nodes.length}
          aria-posinset={position + 1}
          aria-selected={isSelected}
          // Only a node that HAS (or can load) children is expandable — APG forbids the attribute
          // on a leaf, where it would promise an affordance that does not exist.
          aria-expanded={expandable ? isOpen : undefined}
          aria-owns={showGroup ? groupId : undefined}
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
          data-selected={isSelected ? "true" : undefined}
          data-disabled={nodeDisabled ? "" : undefined}
          className="ui-tree-node ui-focus-ring"
          style={{ "--tree-node-level": depth } as React.CSSProperties}
        >
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
        </div>
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

  const isEmpty = visible.length === 0;

  return (
    <>
      <div
        {...ariaProps}
        ref={forwardedRef}
        id={treeId}
        role="tree"
        aria-multiselectable={multiple || checkableProp}
        aria-disabled={disabled || undefined}
        data-size={size}
        data-variant={variant}
        data-show-line={showLine ? "true" : undefined}
        data-empty={isEmpty ? "true" : undefined}
        className={cn("ui-tree", className)}
      >
        {isEmpty ? null : renderNodes(options, 0)}
      </div>
      {/* OUTSIDE the tree, deliberately. `role="tree"` may own only `treeitem` and `group`, so a
          notice parked inside it is a disallowed child — axe says so, and a screen reader would
          be walking a tree whose one "node" is a paragraph. */}
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
