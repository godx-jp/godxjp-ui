import { MoreHorizontal } from "lucide-react";
import * as React from "react";

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
  className,
  children,
  height,
  overflow = "scroll",
  pad,
  style,
  ...props
}: TopbarProp) {
  const barRef = React.useRef<HTMLDivElement | null>(null);
  const foldable = overflow === "menu" && children == null;
  const collapsed = useCollapsesToMenu(barRef, foldable);
  const clusters = (
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

  return (
    <div
      ref={barRef}
      data-height={height}
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
      {children ?? (collapsed ? <TopbarOverflowMenu>{clusters}</TopbarOverflowMenu> : clusters)}
    </div>
  );
}

/**
 * The single "more" cell a collapsed bar shows (gh#914). The clusters move INTO the popover rather
 * than being copied there, so every control exists exactly once: one id, one mounted menu, one
 * place in the tab order.
 */
function TopbarOverflowMenu({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <TopbarItem data-topbar-overflow-trigger="" aria-label={t("layout.topbar.more")}>
          <MoreHorizontal aria-hidden="true" />
        </TopbarItem>
      </PopoverTrigger>
      <PopoverContent align="end" width="auto">
        <div data-slot="topbar-overflow" className="ui-topbar-overflow">
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
): boolean {
  const [collapsed, setCollapsed] = React.useState(false);
  const needed = React.useRef(0);

  React.useLayoutEffect(() => {
    const bar = ref.current;
    if (!enabled || !bar) return undefined;
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
    return () => observer.disconnect();
  }, [ref, enabled, collapsed]);

  return enabled && collapsed;
}
