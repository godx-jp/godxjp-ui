import { revealKeyboardFocus } from "../../lib/focus-reveal";
import { MoreHorizontal } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { useTranslation } from "../../i18n/use-translation";
import { padStyle } from "../../lib/variants";
import { cn } from "../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { TopbarItem } from "./topbar-item";
import type { TopbarProp } from "../../props/components/layout.prop";

export type { TopbarProp, TopbarProp as TopbarProps } from "../../props/components/layout.prop";

/**
 * Topbar — a PURE SLOT bar. It positions three clusters (`start` / `center` / `end`) and owns the
 * bar's flex layout; it does NOT bake any chrome.
 */
export function Topbar({
  start,
  center,
  end,
  identity,
  className,
  children,
  height,
  overflow = "scroll",
  pad,
  style,
  onFocusCapture,
  ...props
}: TopbarProp) {
  const barRef = React.useRef<HTMLDivElement | null>(null);
  const controlsRef = React.useRef<HTMLDivElement | null>(null);
  const hasIdentity = identity != null && children == null;
  const foldable = overflow === "menu" && children == null;
  const hosts = useFoldHosts(foldable);
  const present = { start: start != null, center: center != null, end: end != null };
  const holderRef = React.useRef<HTMLDivElement | null>(null);
  const overflowRef = React.useRef<HTMLDivElement | null>(null);
  /*
   * FOLDING NEVER UNMOUNTS A CONTROL (gh#1478). The clusters used to be rendered in the bar OR
   * inside the "more" PopoverContent — two tree positions, so every fold remounted them, and the
   * content only exists while the popover is open, so a folded bar had NO controls mounted at all:
   * a CommandPalette in `start` lost its ⌘K listener until someone opened the menu. Under
   * `overflow="menu"` each cluster now renders through a portal into a cluster element that is
   * created once and never re-created; folding MOVES that element — into the bar, into the open
   * menu, or into a `hidden` holder while the menu is closed — and React never remounts what is
   * inside it. The element keeps the cluster's own class, so the bar's layout rules still see
   * `.ui-topbar > .ui-topbar-start`.
   */
  const placeClusters = React.useCallback(
    (isCollapsed: boolean) => {
      if (!hosts) return;
      const target = !isCollapsed
        ? hasIdentity
          ? controlsRef.current
          : barRef.current
        : (overflowRef.current ?? holderRef.current);
      if (!target) return;
      for (const key of CLUSTER_ORDER) {
        const node = hosts[key];
        if (!present[key]) node.remove();
        else if (node.parentNode !== target || node !== target.lastElementChild) {
          target.appendChild(node);
        }
      }
    },
    // `present` is derived from the three slots on every render; its booleans are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hosts, hasIdentity, present.start, present.center, present.end],
  );
  const collapsed = useCollapsesToMenu(
    hasIdentity ? controlsRef : barRef,
    foldable,
    hosts ? placeClusters : undefined,
  );
  const overflowNode = React.useCallback(
    (node: HTMLDivElement | null) => {
      overflowRef.current = node;
      placeClusters(true);
    },
    [placeClusters],
  );
  const clusters = hosts ? (
    // Kept mounted in ONE place, whatever the bar is showing; `placeClusters` moves the elements.
    <TopbarClusterHolder ref={holderRef} visible={collapsed} />
  ) : (
    <>
      {start != null ? (
        <div data-slot="topbar-start" className="ui-topbar-start">
          {start}
        </div>
      ) : null}
      {center != null ? (
        <div data-slot="topbar-center" className="ui-topbar-center">
          {center}
        </div>
      ) : null}
      {end != null ? (
        <div data-slot="topbar-end" className="ui-topbar-end">
          {end}
        </div>
      ) : null}
    </>
  );
  const portals = hosts ? (
    <>
      {start != null ? createPortal(start, hosts.start) : null}
      {center != null ? createPortal(center, hosts.center) : null}
      {end != null ? createPortal(end, hosts.end) : null}
    </>
  ) : null;
  const overflowMenu = (
    <TopbarOverflowMenu contentRef={hosts ? overflowNode : undefined}>
      {hosts ? null : clusters}
    </TopbarOverflowMenu>
  );

  return (
    <div
      ref={barRef}
      onFocusCapture={(event) => {
        onFocusCapture?.(event);
        if (!event.defaultPrevented) revealKeyboardFocus(event);
      }}
      data-height={height}
      data-identity={hasIdentity ? "true" : undefined}
      // The overflow contract, published on the bar (gh#728). Always emitted, including for the
      // default, because "scroll" is what the shipped bar DOES and a consumer reading the DOM —
      // or a gate measuring it — must not have to know which value is the default one.
      data-overflow={overflow}
      // The FOLD state, published for the same reason as `data-overflow` above and in the same
      // `="true"` spelling the shell already uses for `.app-root[data-collapsed]`. Emitted whenever
      // the behaviour is LIVE — `overflow="menu"` and no `children` escape hatch — so a gate reads
      // the state instead of inferring it from whether a "more" cell happens to be painted. Absent
      // where the behaviour is off, because "false" there would claim a state that does not apply
      // (gh#914).
      data-collapsed={foldable ? String(collapsed) : undefined}
      style={{ ...style, ...padStyle(pad, undefined) }}
      data-slot="topbar"
      className={cn("ui-topbar", className)}
      {...props}
    >
      {children ??
        (hasIdentity ? (
          <>
            <div
              ref={controlsRef}
              onFocusCapture={revealKeyboardFocus}
              data-slot="topbar-controls"
              data-overflow={overflow}
              className="ui-topbar ui-topbar-controls"
            >
              {collapsed ? overflowMenu : null}
              {collapsed && !hosts ? null : clusters}
            </div>
            <div data-slot="topbar-identity" className="ui-topbar-identity">
              {identity}
            </div>
          </>
        ) : (
          <>
            {collapsed ? overflowMenu : null}
            {collapsed && !hosts ? null : clusters}
          </>
        ))}
      {portals}
    </div>
  );
}

const CLUSTER_ORDER = ["start", "center", "end"] as const;
type ClusterKey = (typeof CLUSTER_ORDER)[number];

const subscribeNothing = () => () => {};

/**
 * One element per cluster, created once on the client and kept for the bar's lifetime (gh#1478).
 * `null` on the server and during hydration — the first client render must match the server's
 * inline clusters — and whenever the bar does not fold.
 */
function useFoldHosts(enabled: boolean): Record<ClusterKey, HTMLDivElement> | null {
  const isClient = React.useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const [hosts] = React.useState(() => {
    if (typeof document === "undefined") return null;
    const make = (key: ClusterKey) => {
      const node = document.createElement("div");
      node.dataset.slot = `topbar-${key}`;
      node.className = `ui-topbar-${key}`;
      return node;
    };
    return { start: make("start"), center: make("center"), end: make("end") };
  });
  React.useEffect(
    () => () => {
      if (hosts) for (const key of CLUSTER_ORDER) hosts[key].remove();
    },
    [hosts],
  );
  return enabled && isClient ? hosts : null;
}

/**
 * Where the folded clusters wait while the "more" menu is closed: in the bar, `hidden`, so they
 * stay mounted (a shortcut listener keeps listening) but take no space, no focus and no part in
 * the accessibility tree. Rendered (empty) while the bar is expanded too, so it is never itself
 * re-created.
 */
const TopbarClusterHolder = React.forwardRef<HTMLDivElement, { visible: boolean }>(
  function TopbarClusterHolder({ visible }, ref) {
    return visible ? <div ref={ref} hidden data-slot="topbar-fold-holder" /> : null;
  },
);

/**
 * The single "more" cell a collapsed bar shows (gh#914). The clusters move INTO the popover rather
 * than being copied there, so every control exists exactly once: one id, one mounted menu, one
 * place in the tab order.
 */
function TopbarOverflowMenu({
  children,
  contentRef,
}: {
  children: React.ReactNode;
  /** Receives the open menu's cluster box, so folded clusters can be MOVED into it (gh#1478). */
  contentRef?: React.Ref<HTMLDivElement>;
}) {
  const { t } = useTranslation();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <TopbarItem data-topbar-overflow-trigger="" aria-label={t("layout.topbar.more")}>
          <MoreHorizontal aria-hidden="true" />
        </TopbarItem>
      </PopoverTrigger>
      <PopoverContent align="end" width="auto">
        <div ref={contentRef} data-slot="topbar-overflow" className="ui-topbar-overflow">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Whether a `overflow="menu"` bar must collapse its clusters into the "more" menu (gh#914).
 *
 * Expanded, the bar measures itself: content wider than the box means collapse, and the width the
 * content needed is remembered. Collapsed, the clusters are no longer in the bar, so there is
 * nothing to measure; the bar expands again once its box is at least as wide as that remembered
 * width. Runs in a layout effect so a bar that does not fit never paints expanded.
 */
function useCollapsesToMenu(
  ref: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
  /** Puts the cluster elements where the current state shows them, BEFORE the bar is measured. */
  place?: (collapsed: boolean) => void,
): boolean {
  const [collapsed, setCollapsed] = React.useState(false);
  const needed = React.useRef(0);

  React.useLayoutEffect(() => {
    const bar = ref.current;
    if (!enabled || !bar) return undefined;
    place?.(collapsed);
    const update = () => {
      if (!collapsed) {
        if (bar.clientWidth > 0 && bar.scrollWidth - bar.clientWidth > 1) {
          needed.current = bar.scrollWidth;
          setCollapsed(true);
        }
      } else if (bar.clientWidth >= needed.current) {
        setCollapsed(false);
      }
    };
    update();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    // The clusters too: a larger text size grows their content while the bar's own box stays put,
    // and only a cluster resize says so (gh#1320).
    if (!collapsed)
      for (const cluster of bar.children) {
        observer.observe(cluster);
        // The identity layout flattens start with display: contents; observe its real boxes too.
        if (cluster.getAttribute("data-slot") === "topbar-start") {
          for (const cell of cluster.children) observer.observe(cell);
        }
      }
    return () => observer.disconnect();
  }, [ref, enabled, collapsed, place]);

  return enabled && collapsed;
}
