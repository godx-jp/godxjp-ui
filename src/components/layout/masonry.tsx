import * as React from "react";

import { isDevelopment } from "../../lib/dev";
import { useMediaQuery } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import type { BreakpointProp, GapProp } from "../../props/vocabulary";
import type {
  MasonryItemProp,
  MasonryLayoutEntryProp,
  MasonryProp,
} from "../../props/components/layout.prop";

export type {
  MasonryColumnsProp,
  MasonryGapProp,
  MasonryItemProp,
  MasonryLayoutEntryProp,
  MasonryProp,
  MasonryProp as MasonryProps,
} from "../../props/components/layout.prop";

/**
 * The four steps `Flex direction` already responds to, spelled as the media queries the
 * `--flex-direction-*` cascade uses in `styles/layout.css`. They stay LITERALS for the reason
 * `navigation-layout.css` states at its own copy: a media query cannot read a custom property.
 */
const BREAKPOINT_QUERY: Record<BreakpointProp, string> = {
  sm: "(min-width: 40rem)",
  md: "(min-width: 48rem)",
  lg: "(min-width: 64rem)",
  xl: "(min-width: 80rem)",
};

/** Widest first — the order antd's `responsiveArray` walks, minus the two steps this library has no name for. */
const BREAKPOINT_ORDER: BreakpointProp[] = ["xl", "lg", "md", "sm"];

const COLUMN_STEPS = new Set<string>(["base", ...BREAKPOINT_ORDER]);

/** antd's own default, ported unchanged. */
const DEFAULT_COLUMNS = 3;

/**
 * A `GapProp` step as the CSS length the package already publishes for it.
 *
 * Named steps are AXIS-AWARE here exactly as they are on `Flex`: a row's `gap="md"` is
 * `--space-inline-md` (12px) and a column's is `--space-stack-md` (16px), because the eye needs
 * less space between things side by side than between things stacked. Numeric steps go straight
 * to `--space-{n}` on both axes, which is what makes a number mean a VALUE and a name mean an
 * INTENT (see `GapStepProp`).
 */
function gapToken(step: GapProp, axis: "inline" | "block"): string {
  if (step === "none" || step === 0) return "0px";
  if (typeof step === "number") return `var(--space-${step})`;
  return axis === "inline" ? `var(--space-inline-${step})` : `var(--space-stack-${step})`;
}

/** `[key, height, pinnedColumn]` — antd's `ItemHeightData`, same shape and same order. */
type ItemMetric = [key: React.Key, height: number, column: number | undefined];

type Metrics = { rowGap: number; items: ItemMetric[] };

const EMPTY_METRICS: Metrics = { rowGap: 0, items: [] };

function sameMetrics(a: Metrics, b: Metrics): boolean {
  if (a.rowGap !== b.rowGap || a.items.length !== b.items.length) return false;
  return a.items.every((metric, index) => {
    const other = b.items[index];
    return metric[0] === other[0] && metric[1] === other[1] && metric[2] === other[2];
  });
}

type Position = { column: number; top: number };

/**
 * antd's `usePositions`, ported line for line, including the property that its own comment calls
 * out: positions are STABLE BY ORDER. Each tile is placed into whichever column is shortest AT
 * THAT MOMENT and never reconsidered, so a tile appearing later can never move a tile placed
 * earlier. The alternative — a bin-packing pass that minimises the ragged edge — reshuffles the
 * whole grid every time one image finishes decoding.
 */
function packColumns(
  metrics: ItemMetric[],
  columnCount: number,
  rowGap: number,
): { positions: Map<React.Key, Position>; totalHeight: number } {
  const columnHeights = new Array<number>(columnCount).fill(0);
  const positions = new Map<React.Key, Position>();

  for (const [key, height, pinned] of metrics) {
    const shortest = columnHeights.indexOf(Math.min(...columnHeights));
    // antd clamps only the TOP end (`Math.min(itemColumn, columnCount - 1)`), so a negative
    // `column` indexes off the front of the array there and poisons every later height with NaN.
    // Clamping both ends is the one defensive difference in this function.
    const target =
      pinned === undefined ? shortest : Math.min(Math.max(Math.trunc(pinned), 0), columnCount - 1);

    positions.set(key, { column: target, top: columnHeights[target] });
    columnHeights[target] += height + rowGap;
  }

  // The trailing gap belongs to no tile, so it comes back off the container.
  return { positions, totalHeight: Math.max(0, Math.max(...columnHeights, 0) - rowGap) };
}

type MasonryStyle = React.CSSProperties & {
  "--masonry-column-count"?: number;
  "--masonry-gap-inline"?: string;
  "--masonry-gap-block"?: string;
};

type MasonryItemStyle = React.CSSProperties & { "--masonry-item-column"?: number };

/**
 * Masonry — Ant Design `Masonry` (6.0.0): tiles of unequal height packed into columns, each tile
 * dropped into whichever column is shortest when its turn comes.
 *
 * ## Reading order is the real accessibility question, and this layout answers it by construction
 *
 * A masonry has two orders and they do not agree. **DOM order is `items` order, always** — the
 * tiles are absolutely positioned, so nothing in this component ever reorders the DOM. A screen
 * reader therefore reads, and the Tab key therefore visits, exactly the sequence the caller
 * passed, at every width and in every column count. **Visual order is the packing** — with three
 * columns, items 1·2·3 open the three columns and item 4 lands under whichever of them is
 * shortest, so a later item can sit visually ABOVE an earlier one.
 *
 * That divergence is inherent to the form, not a defect to paper over, and it has one consequence
 * the caller owns: **order `items` by importance, never by height.** `MasonryItem.column` makes
 * the gap wider on purpose — a tile pinned to a column can end up far down the page while staying
 * second in the reading order — so pin sparingly, and never to fake a visual sequence.
 *
 * The alternative implementation is worse on exactly this axis. CSS `column-count` fills the
 * first column to the bottom before starting the second, so in a 30-tile feed the second tile in
 * the DOM paints at the bottom-left of the screen; here the second tile paints at the top of the
 * second column. Absolute placement is what keeps the two orders as close as a masonry can get
 * them.
 *
 * ## It carries no ARIA, and that is the decision, not an omission
 *
 * The container is a plain `<div>` with no role, and so is each tile. WAI-ARIA 1.2 has no role
 * for this, and every near-miss is worse than nothing:
 *
 * - `list` / `listitem` would announce "list, N items" over content that is usually already
 *   headed, linked and structured — and would strip the tiles' own semantics on some AT.
 * - `group` must have an accessible name to be conveyed at all; an unnamed one is discarded, and
 *   naming a layout forces a string the caller has no reason to have.
 * - `region` is a landmark: three masonries on a page would ship three landmarks that axe's
 *   `landmark-unique` rejects — the exact collision gh#817 recorded for the table scroll region.
 * - `grid` / `table` promise a row/column keyboard model that this has none of.
 * - `presentation` / `none` on a `<div>` is a no-op.
 *
 * So the first rule of ARIA applies: no role is the correct role. The tiles' own content carries
 * the semantics, and the caller wraps the masonry in `<section aria-labelledby>` (or a `Flex`
 * with a label, which does this for you) when the COLLECTION needs a name.
 *
 * There are no strings here either — no label, no `aria-label`, no announcement — so the
 * component has nothing to route through `t()`. That is a property of a pure layout, and it is
 * stated rather than papered over with an invented "masonry" label nobody asked for.
 *
 * ## The four deliberate differences from antd, each with its reason at the point of deviation
 *
 * 1. **`gap`, not `gutter`** (and a `GapProp` token step, not a raw pixel number). This package
 *    already owns that axis under that name on `Flex`, `ResponsiveGrid` and `AuthStack`, and
 *    `check:prop-vocabulary` maps a field called `gap` to `GapProp`. `gutter` is typed `never` so
 *    arriving from antd's docs is a compile error that names the replacement.
 * 2. **Breakpoint steps are `base sm md lg xl`, not `xs sm md lg xl xxl`.** antd's `xs` IS this
 *    library's `base`; `xxl` has no step here. Both are rejected by TypeScript and named in a
 *    development warning rather than silently dropped.
 * 3. **`classNames` / `styles` are not ported** — the standing decision for every antd port here
 *    (docs/DESIGN-AUTHORITY.md, "a knob that only a fork could reach is not parity either").
 *    `src/tokens/components/masonry.css` is the answer.
 * 4. **`MasonryItem.height` is honoured.** antd declares and documents the field and then never
 *    reads it — its layout is measured from `getBoundingClientRect()` alone, and all six of its
 *    demos carry their heights in `data`. Shipping an inert prop is worse than shipping none, so
 *    here a finite `height` sizes the tile and skips its measurement, which is also what lets a
 *    first paint and an SSR render land in the right place.
 *
 * And one thing that is NOT ported: antd animates tile REMOVAL through rc-motion's `CSSMotionList`
 * (`motionLeave`). A removed tile here disappears at once. The arrival fade and the re-flow slide
 * are ported, in CSS, and both snap under `prefers-reduced-motion: reduce`.
 */
export const Masonry = React.forwardRef(function Masonry<TData = unknown>(
  {
    items,
    itemRender,
    columns = DEFAULT_COLUMNS,
    gap,
    gutter,
    fresh = false,
    onLayoutChange,
    id,
    className,
    ...rest
  }: MasonryProp<TData>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const itemRefs = React.useRef(new Map<React.Key, HTMLDivElement | null>());

  const matched: Record<BreakpointProp, boolean> = {
    sm: useMediaQuery(BREAKPOINT_QUERY.sm),
    md: useMediaQuery(BREAKPOINT_QUERY.md),
    lg: useMediaQuery(BREAKPOINT_QUERY.lg),
    xl: useMediaQuery(BREAKPOINT_QUERY.xl),
  };

  if (isDevelopment()) {
    if (gutter !== undefined) {
      console.warn(
        '[@godxjp/ui] Masonry: `gutter` is Ant Design\'s name for this axis; here it is `gap`, and it takes a GapProp token step (`"sm"`, `4`, `["md", "lg"]`) rather than a pixel number. The value was IGNORED.',
      );
    }
    if (columns !== null && typeof columns === "object") {
      const unknown = Object.keys(columns).filter((step) => !COLUMN_STEPS.has(step));
      if (unknown.length > 0) {
        console.warn(
          `[@godxjp/ui] Masonry: \`columns\` has no step ${unknown.join(", ")} — the steps here are base | sm | md | lg | xl. Ant Design's \`xs\` is \`base\`, and there is no \`xxl\`. The key(s) were IGNORED.`,
        );
      }
    }
  }

  const columnCount = React.useMemo(() => {
    const resolved = (() => {
      if (typeof columns === "number") return columns;
      // antd walks its breakpoints widest-first and takes the first step that BOTH matches the
      // viewport and declares a value; anything else falls back to the mobile-first floor.
      for (const step of BREAKPOINT_ORDER) {
        if (matched[step] && columns[step] !== undefined) return columns[step] as number;
      }
      return columns.base ?? 1;
    })();
    // antd does not clamp, and `columns={0}` walks off the end of its own array. One column is the
    // smallest thing a masonry can be.
    return Math.max(1, Math.trunc(resolved) || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, matched.sm, matched.md, matched.lg, matched.xl]);

  const [inlineGap, blockGap] = React.useMemo<[GapProp | undefined, GapProp | undefined]>(() => {
    if (gap === undefined) return [undefined, undefined];
    // antd's `[Gap, Gap]` is [horizontal, vertical]; logical names for the same two axes.
    return Array.isArray(gap) ? [gap[0], gap[1]] : [gap, gap];
  }, [gap]);

  const [metrics, setMetrics] = React.useState<Metrics>(EMPTY_METRICS);

  const measure = React.useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    // The spacing is read back off the DOM rather than recomputed from the prop: the token
    // (`--masonry-gap-block`, or the `--space-*` step the prop resolves to) is then the single
    // source for both the painted gap and the arithmetic, and it stays correct under `--scaling`,
    // under a `[data-tenant]` override and under any theme that retunes the step.
    const rowGap = Number.parseFloat(window.getComputedStyle(root).rowGap) || 0;

    const next: ItemMetric[] = (items ?? []).map((item, index) => {
      const key = item.key ?? index;
      if (typeof item.height === "number" && Number.isFinite(item.height)) {
        return [key, item.height, item.column];
      }
      const element = itemRefs.current.get(key);
      return [key, element ? element.getBoundingClientRect().height : 0, item.column];
    });

    setMetrics((previous) => {
      const candidate: Metrics = { rowGap, items: next };
      return sameMetrics(previous, candidate) ? previous : candidate;
    });
  }, [items]);

  /** antd coalesces every measurement into one animation frame (`useDelay`). */
  const frameRef = React.useRef<number | null>(null);
  const scheduleMeasure = React.useCallback(() => {
    if (typeof window === "undefined") return;
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      measure();
    });
  }, [measure]);

  React.useEffect(
    () => () => {
      if (frameRef.current !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  // Synchronous, before paint, so the tiles are never shown at 0,0 for a frame and so the layout
  // is deterministic in a test environment. The observers below coalesce into a frame instead.
  React.useLayoutEffect(() => {
    measure();
  }, [measure, columnCount, inlineGap, blockGap]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    // An image decoding inside a tile changes the TILE's height, not the container's, and `load`
    // does not bubble — so it is listened for in the CAPTURE phase on the container, which is
    // where antd's `onLoad`/`onError` props on the same element are aiming.
    root.addEventListener("load", scheduleMeasure, true);
    root.addEventListener("error", scheduleMeasure, true);

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(scheduleMeasure);
      observer.observe(root);
      // `fresh` — antd wraps EVERY tile in its own ResizeObserver so a tile that changes height in
      // place (a "show more", a chart settling, a lazy image) re-packs the columns. Off, only the
      // container's own resize and the load events above can trigger a re-pack.
      if (fresh) {
        for (const element of itemRefs.current.values()) {
          if (element) observer.observe(element);
        }
      }
    }

    return () => {
      root.removeEventListener("load", scheduleMeasure, true);
      root.removeEventListener("error", scheduleMeasure, true);
      observer?.disconnect();
    };
  }, [scheduleMeasure, fresh, items]);

  const { positions, totalHeight } = React.useMemo(
    () => packColumns(metrics.items, columnCount, metrics.rowGap),
    [metrics, columnCount],
  );

  // antd fires `onLayoutChange` only once EVERY tile has a resolved position and the count agrees
  // with `items`, and dedupes an unchanged [item, column] list. Its documented payload is
  // `{ key, column }[]`; its implementation spreads the whole item, which is what is ported.
  const lastLayoutRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!onLayoutChange || !items || items.length === 0) return;
    if (items.length !== positions.size) return;
    if (!items.every((item, index) => positions.has(item.key ?? index))) return;

    const layout: MasonryLayoutEntryProp<TData>[] = items.map((item, index) => ({
      ...item,
      column: positions.get(item.key ?? index)!.column,
    }));
    const signature = layout.map((entry) => `${String(entry.key)}:${entry.column}`).join("|");
    if (signature === lastLayoutRef.current) return;
    lastLayoutRef.current = signature;
    onLayoutChange(layout);
  }, [items, positions, onLayoutChange]);

  const style: MasonryStyle = {
    "--masonry-column-count": columnCount,
    ...(inlineGap === undefined
      ? undefined
      : { "--masonry-gap-inline": gapToken(inlineGap, "inline") }),
    ...(blockGap === undefined
      ? undefined
      : { "--masonry-gap-block": gapToken(blockGap, "block") }),
    blockSize: totalHeight,
  };

  return (
    <div
      ref={(element) => {
        rootRef.current = element;
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
      }}
      id={id}
      data-slot="masonry"
      className={cn("ui-masonry", className)}
      style={style}
      {...rest}
    >
      {(items ?? []).map((item: MasonryItemProp<TData>, index) => {
        const key = item.key ?? index;
        const position = positions.get(key);
        const itemStyle: MasonryItemStyle = {
          "--masonry-item-column": position?.column ?? 0,
          insetBlockStart: position?.top ?? 0,
          ...(typeof item.height === "number" && Number.isFinite(item.height)
            ? { blockSize: item.height }
            : undefined),
        };
        return (
          <div
            key={key}
            ref={(element) => {
              itemRefs.current.set(key, element);
            }}
            data-slot="masonry-item"
            data-positioned={position ? "" : undefined}
            className="ui-masonry-item"
            style={itemStyle}
          >
            {/* antd: `children` wins over `itemRender`, and `itemRender` is handed the live index
                and column alongside the item. */}
            {item.children ?? itemRender?.({ ...item, index, column: position?.column ?? 0 })}
          </div>
        );
      })}
    </div>
  );
}) as (<TData = unknown>(
  props: MasonryProp<TData> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement) & { displayName?: string };

Masonry.displayName = "Masonry";
