// Descriptions — for detail-page metadata. Replaces hand-rolled <dl><dt><dd> layouts.
import * as React from "react";

import { cn } from "../../lib/utils";
import type { BreakpointProp } from "../../props/vocabulary/interaction.prop";
import type { DescriptionsLayoutProp } from "../../props/vocabulary/interaction.prop";
import type {
  DescriptionsColumnProp,
  DescriptionsItemsProp,
  DescriptionsSpanProp,
} from "../../props/vocabulary/data.prop";

export type { DescriptionsLayoutProp };

type DescriptionsLayoutContextValue = {
  layout: DescriptionsLayoutProp;
  labelAlign: "start" | "end";
  bordered: boolean;
};

const DescriptionsLayoutContext = React.createContext<DescriptionsLayoutContextValue>({
  layout: "vertical",
  labelAlign: "start",
  bordered: false,
});

/** Mobile-first ladder, in the order the stylesheet's media queries repoint the custom property. */
const BREAKPOINT_LADDER: readonly BreakpointProp[] = ["sm", "md", "lg", "xl"];

/**
 * Publish a responsive `{ sm, md, lg, xl }` map as `--<name>-base|sm|md|lg|xl`. Each media query
 * in the stylesheet re-points the live custom property to the narrowest declared step at or below
 * it, so the ladder is mobile-first with no per-step duplication.
 */
function responsiveVars(
  name: string,
  base: number,
  steps: Partial<Record<BreakpointProp, number>>,
): React.CSSProperties {
  const vars: Record<string, number> = { [`${name}-base`]: base };
  for (const step of BREAKPOINT_LADDER) {
    const value = steps[step];
    if (value !== undefined) vars[`${name}-${step}`] = value;
  }
  return vars as React.CSSProperties;
}

export interface DescriptionsProps {
  /**
   * Column count. A plain `1 | 2 | 3` keeps this library's own responsive ladder exactly as it
   * was; any other number, or antd's `{ sm, md, lg, xl }` responsive object, drives the
   * token-published grid instead (antd `column`).
   */
  columns?: DescriptionsColumnProp;
  /** Label placement within each item. Default `vertical` (label over value). */
  layout?: DescriptionsLayoutProp;
  /**
   * Applies only in `layout="horizontal"` — a vertical label sits above the value and end-aligning
   * it there would read as a mistake, exactly like `Form`'s own contract.
   */
  labelAlign?: "start" | "end";
  /**
   * Draw the grid as a bordered table (antd `bordered`): an outer frame, a rule between every
   * cell, and a shaded label cell. Colour and rhythm come from the `--descriptions-*` tokens.
   */
  bordered?: boolean;
  /**
   * Declarative items (antd `items`) — an alternative to composing `Descriptions.Item` children.
   * Both work; `items` renders first, then any children after it.
   */
  items?: DescriptionsItemsProp;
  className?: string;
  children?: React.ReactNode;
}

/** The legacy numeric ladder — the exact utilities `columns={1 | 2 | 3}` has always painted. */
const LEGACY_COLUMN_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

export function Descriptions({
  columns = 2,
  layout = "vertical",
  labelAlign = "start",
  bordered = false,
  items,
  className,
  children,
}: DescriptionsProps) {
  const legacyColumns = typeof columns === "number" ? LEGACY_COLUMN_CLASS[columns] : undefined;
  // Anything the legacy ladder does not cover — a 4+ column grid, or antd's responsive object —
  // is painted from the published custom properties instead.
  const responsiveColumns =
    legacyColumns === undefined
      ? typeof columns === "number"
        ? { sm: Math.min(columns, 2), lg: columns }
        : columns
      : undefined;
  const context = React.useMemo(
    () => ({ layout, labelAlign, bordered }),
    [layout, labelAlign, bordered],
  );
  return (
    <DescriptionsLayoutContext.Provider value={context}>
      {}
      <dl
        data-slot="descriptions"
        // assertable / themeable whichever responsive `grid-cols-*` utilities happen to paint it.
        data-columns={typeof columns === "number" ? columns : undefined}
        data-columns-responsive={responsiveColumns ? "" : undefined}
        data-bordered={bordered ? "" : undefined}
        style={
          responsiveColumns
            ? responsiveVars("--descriptions-column-count", 1, responsiveColumns)
            : undefined
        }
        className={cn(
          "grid gap-x-[var(--descriptions-column-gap)] gap-y-[var(--descriptions-row-gap)]",
          legacyColumns,
          className,
        )}
      >
        {items?.map((item, index) => (
          <DescriptionsItem
            key={item.key ?? index}
            label={item.label}
            mono={item.mono}
            span={item.span}
            className={item.className}
          >
            {item.children ?? item.value}
          </DescriptionsItem>
        ))}
        {children}
      </dl>
    </DescriptionsLayoutContext.Provider>
  );
}

export interface DescriptionsItemProps {
  label: React.ReactNode;
  /** Use mono spacing for IDs, paths, JSON. */
  mono?: boolean;
  /**
   * Span full row(s) when the value is long. `2` / `3` keep the ladder they have always painted;
   * `"filled"` takes the whole remaining row (antd), and a responsive `{ sm, md, lg, xl }` object
   * spans a different number of columns per step.
   */
  span?: DescriptionsSpanProp;
  className?: string;
  children: React.ReactNode;
}

/** The legacy span ladder — the exact utilities `span={2 | 3}` has always painted. */
const LEGACY_SPAN_CLASS: Record<number, string> = {
  2: "sm:col-span-2",
  3: "sm:col-span-2 lg:col-span-3",
};

function DescriptionsItem({ label, mono, span, className, children }: DescriptionsItemProps) {
  const { layout, labelAlign } = React.useContext(DescriptionsLayoutContext);
  const legacySpan = typeof span === "number" ? LEGACY_SPAN_CLASS[span] : undefined;
  const responsiveSpan =
    span !== undefined && span !== "filled" && legacySpan === undefined
      ? typeof span === "number"
        ? { sm: span }
        : span
      : undefined;
  // The EFFECTIVE label alignment, after the vertical guard below. Reflected only when it is the
  // non-default `end` so an untouched item gains no attribute (the `data-priority` rule).
  const endAlignedLabel = layout === "horizontal" && labelAlign === "end";
  return (
    <div
      data-slot="descriptions-item"
      // The RESOLVED item layout, reflected so the bordered grid can put the rule between a label
      // and the value BESIDE it without keying off whichever grid utility paints the pair today.
      data-layout={layout}
      data-span={span === "filled" ? "filled" : undefined}
      data-span-responsive={responsiveSpan ? "" : undefined}
      style={
        responsiveSpan ? responsiveVars("--descriptions-item-span", 1, responsiveSpan) : undefined
      }
      className={cn(
        layout === "horizontal"
          ? // Label beside value — a token-aligned label column so the values line up. The
            // `--descriptions-label-width` / `--descriptions-label-gap` knobs align labels and set
            // to close the gap in the same step.
            "grid grid-cols-[var(--descriptions-label-width)_minmax(0,1fr)] items-baseline gap-x-[var(--descriptions-label-gap)]"
          : // Vertical (default): label over value. The shared --field-label-gap matches
            // FormField / Form so the label→value gap is consistent everywhere.
            "grid gap-[var(--field-label-gap)]",
        legacySpan,
        className,
      )}
    >
      <dt
        data-slot="descriptions-label"
        data-label-align={endAlignedLabel ? "end" : undefined}
        className={cn(
          // Size comes from the token pair, NOT from `text-xs`: a hard-coded utility here left the
          // label one type step below the value beside it, and out of reach of a service theme.
          // The muted colour is what distinguishes a label from its value.
          "text-muted-foreground text-[length:var(--descriptions-label-font-size)] leading-[var(--descriptions-label-line-height)]",
          // `end`-align only ever applies in horizontal layout — same guard `Form` uses, so a
          endAlignedLabel && "text-end",
        )}
      >
        {label}
      </dt>
      {/* The pair is deliberately a token rather than a shared CSS class: a class would have to live in one stylesheet, and a slim build importing only `styles/data-display` (or only the form layers) would miss it — tokens ship in the REQUIRED foundation, so both call sites always resolve. */}
      <dd
        data-slot="descriptions-value"
        // `mono` is a typography CONTRACT (IDs / paths / JSON read in the mono face), reflected so
        // it survives the face moving from a utility to a token.
        data-mono={mono ? "" : undefined}
        className={cn(
          "text-[length:var(--descriptions-value-font-size)] leading-[var(--descriptions-value-line-height)] break-all",
          mono && "font-mono",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

Descriptions.Item = DescriptionsItem;
