import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import { useScrollsHorizontally } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import type {
  OrgChartNodeProp,
  OrgChartProp,
  TreeNodeProp,
} from "../../props/components/data-display.prop";
import { Tree } from "./tree";

export type {
  OrgChartNodeProp,
  OrgChartNodeVariantProp,
  OrgChartProp,
  OrgChartProp as OrgChartProps,
} from "../../props/components/data-display.prop";

type FlatNode = {
  node: OrgChartNodeProp;
  depth: number;
  parent: number | null;
  firstChild: number | null;
};

/** Depth-first reading order — the order APG's ↓/↑ walk, and the index each node's ids hang off. */
function flatten(nodes: readonly OrgChartNodeProp[]): FlatNode[] {
  const out: FlatNode[] = [];
  const walk = (list: readonly OrgChartNodeProp[], depth: number, parent: number | null) => {
    for (const node of list) {
      const index = out.length;
      out.push({ node, depth, parent, firstChild: null });
      if (node.children?.length) {
        out[index].firstChild = out.length;
        walk(node.children, depth + 1, index);
      }
    }
  };
  walk(nodes, 0, null);
  return out;
}

function toTreeData(nodes: readonly OrgChartNodeProp[]): TreeNodeProp[] {
  return nodes.map((node) => ({
    value: node.key,
    label: node.name,
    children: node.children?.length ? toTreeData(node.children) : undefined,
  }));
}

/** Direction at the NODE, as in `Tree`: `→` means "into the children" for the region being read. */
function isRtl(element: HTMLElement): boolean {
  return element.closest("[dir]")?.getAttribute("dir")?.toLowerCase() === "rtl";
}

/**
 * OrgChart — an organization chart: boxes joined by lines, top-down.
 *
 * The chart is the WAI-ARIA APG Tree View (`role="tree"` / `treeitem` / `group`, one roving tab
 * stop, arrow keys). The lines are CSS borders drawn in the gaps between boxes — no SVG, no layout
 * library — so they are always where the boxes are. A chart wider than its container scrolls in
 * a named, keyboard-reachable region of its own; a CONTAINER narrower than the chart's breakpoint
 * (a container query, not the viewport) shows the same data as an indented `Tree` instead.
 */
function OrgChartRoot({
  data,
  renderNode,
  label,
  className,
  id,
  forwardedRef,
  ...rest
}: OrgChartProp & { forwardedRef?: React.Ref<HTMLDivElement> }) {
  const { t } = useTranslation();
  const reactId = React.useId();
  const baseId = id ?? `${reactId}-org-chart`;
  const treeLabel = label ?? t("dataDisplay.orgChart.label");

  const flat = React.useMemo(() => flatten(data), [data]);
  const indexByKey = React.useMemo(
    () => new Map(flat.map((entry, index) => [entry.node.key, index])),
    [flat],
  );

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scrolls = useScrollsHorizontally(scrollRef, true);

  // ── roving tabindex: exactly one box is in the tab ring ──────────────────────────────────
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const rovingKey =
    (activeKey && indexByKey.has(activeKey) ? activeKey : null) ?? flat[0]?.node.key ?? null;
  const nodeRefs = React.useRef(new Map<string, HTMLDivElement | null>());
  const moveTo = (index: number | null) => {
    if (index == null) return;
    const entry = flat[index];
    if (!entry) return;
    setActiveKey(entry.node.key);
    nodeRefs.current.get(entry.node.key)?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    const entry = flat[index];
    const rtl = isRtl(event.currentTarget);
    const inward = rtl ? "ArrowLeft" : "ArrowRight";
    const outward = rtl ? "ArrowRight" : "ArrowLeft";
    let target: number | null | undefined;
    if (event.key === "ArrowDown") target = index + 1 < flat.length ? index + 1 : null;
    else if (event.key === "ArrowUp") target = index > 0 ? index - 1 : null;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = flat.length - 1;
    else if (event.key === inward) target = entry.firstChild;
    else if (event.key === outward) target = entry.parent;
    else return;
    event.preventDefault();
    moveTo(target ?? null);
  };

  const renderBranch = (nodes: readonly OrgChartNodeProp[]): React.ReactNode =>
    nodes.map((node, position) => {
      const index = indexByKey.get(node.key)!;
      const { depth } = flat[index];
      const nodeId = `${baseId}-n${index}`;
      const groupId = `${nodeId}-group`;
      const hasChildren = Boolean(node.children?.length);
      const isAgent = node.variant === "agent";
      const labelledBy = renderNode
        ? undefined
        : [
            `${nodeId}-name`,
            node.title ? `${nodeId}-title` : null,
            isAgent ? `${nodeId}-kind` : null,
          ]
            .filter(Boolean)
            .join(" ");
      return (
        <li key={node.key} role="none" className="ui-org-chart-branch">
          <div
            ref={(element) => {
              nodeRefs.current.set(node.key, element);
            }}
            id={nodeId}
            role="treeitem"
            aria-level={depth + 1}
            aria-setsize={nodes.length}
            aria-posinset={position + 1}
            aria-labelledby={labelledBy}
            aria-describedby={!renderNode && node.extra ? `${nodeId}-extra` : undefined}
            // The group is a DOM sibling so the box stays one box tall; ownership is explicit.
            aria-owns={hasChildren ? groupId : undefined}
            tabIndex={rovingKey === node.key ? 0 : -1}
            data-key={node.key}
            data-variant={isAgent ? "agent" : "person"}
            className="ui-org-chart-node ui-focus-ring"
            onFocus={() => setActiveKey(node.key)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {renderNode ? (
              renderNode(node)
            ) : (
              <>
                {node.avatar ? (
                  <span aria-hidden="true" className="ui-org-chart-avatar">
                    {node.avatar}
                  </span>
                ) : null}
                <span className="ui-org-chart-text">
                  <span id={`${nodeId}-name`} className="ui-org-chart-name">
                    {node.name}
                  </span>
                  {node.title ? (
                    <span id={`${nodeId}-title`} className="ui-org-chart-title">
                      {node.title}
                    </span>
                  ) : null}
                  {node.extra ? (
                    <span id={`${nodeId}-extra`} className="ui-org-chart-extra">
                      {node.extra}
                    </span>
                  ) : null}
                </span>
              </>
            )}
            {/* The dashed edge is never the only channel (WCAG 1.4.1). */}
            {isAgent ? (
              <span id={`${nodeId}-kind`} className="sr-only">
                {t("dataDisplay.orgChart.agent")}
              </span>
            ) : null}
          </div>
          {hasChildren ? (
            <ul id={groupId} role="group" className="ui-org-chart-children">
              {renderBranch(node.children!)}
            </ul>
          ) : null}
        </li>
      );
    });

  const treeData = React.useMemo(() => toTreeData(data), [data]);
  const nodeByKey = React.useMemo(
    () => new Map(flat.map((entry) => [entry.node.key, entry.node])),
    [flat],
  );

  return (
    <div {...rest} ref={forwardedRef} id={id} className={cn("ui-org-chart", className)}>
      <div
        ref={scrollRef}
        className="ui-org-chart-scroll"
        // Only a chart that actually overflows earns a focus stop, and then a NAMED one (the Table
        // scroll rule, axe `scrollable-region-focusable`).
        {...(scrolls
          ? { role: "region", "aria-label": t("dataDisplay.orgChart.scrollRegion"), tabIndex: 0 }
          : {})}
      >
        <ul role="tree" aria-label={treeLabel} className="ui-org-chart-tree">
          {renderBranch(data)}
        </ul>
      </div>
      <div className="ui-org-chart-list">
        <Tree
          aria-label={treeLabel}
          treeData={treeData}
          defaultExpandAll
          titleRender={(treeNode) => {
            const node = nodeByKey.get(treeNode.value);
            if (!node) return treeNode.label;
            if (renderNode) return renderNode(node);
            return (
              <span className="ui-org-chart-list-row">
                {node.avatar ? (
                  <span aria-hidden="true" className="ui-org-chart-avatar">
                    {node.avatar}
                  </span>
                ) : null}
                <span className="ui-org-chart-name">{node.name}</span>
                {node.title ? <span className="ui-org-chart-title">{node.title}</span> : null}
                {node.variant === "agent" ? (
                  <span className="sr-only">{t("dataDisplay.orgChart.agent")}</span>
                ) : null}
                {node.extra ? <span className="ui-org-chart-extra">{node.extra}</span> : null}
              </span>
            );
          }}
        />
      </div>
    </div>
  );
}

/** `ref` reaches the root `<div>` — the container the breakpoint is measured against. */
export const OrgChart = React.forwardRef<HTMLDivElement, OrgChartProp>((props, ref) => (
  <OrgChartRoot {...props} forwardedRef={ref} />
));
OrgChart.displayName = "OrgChart";
