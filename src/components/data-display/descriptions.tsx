// Descriptions — for detail-page metadata. Replaces hand-rolled <dl><dt><dd> layouts.
import * as React from "react";

import { cn } from "../../lib/utils";
import type { DescriptionsLayoutProp } from "../../props/vocabulary/interaction.prop";

export type { DescriptionsLayoutProp };

type DescriptionsLayoutContextValue = {
  layout: DescriptionsLayoutProp;
  labelAlign: "start" | "end";
};

const DescriptionsLayoutContext = React.createContext<DescriptionsLayoutContextValue>({
  layout: "vertical",
  labelAlign: "start",
});

export interface DescriptionsProps {
  columns?: 1 | 2 | 3;
  /** Label placement within each item. Default `vertical` (label over value). */
  layout?: DescriptionsLayoutProp;
  /**
   * Applies only in `layout="horizontal"` — a vertical label sits above the value and end-aligning
   * it there would read as a mistake, exactly like `Form`'s own contract.
   */
  labelAlign?: "start" | "end";
  className?: string;
  children: React.ReactNode;
}

export function Descriptions({
  columns = 2,
  layout = "vertical",
  labelAlign = "start",
  className,
  children,
}: DescriptionsProps) {
  const colsClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";
  const context = React.useMemo(() => ({ layout, labelAlign }), [layout, labelAlign]);
  return (
    <DescriptionsLayoutContext.Provider value={context}>
      {}
      <dl
        data-slot="descriptions"
        // assertable / themeable whichever responsive `grid-cols-*` utilities happen to paint it.
        data-columns={columns}
        className={cn(
          "grid gap-x-[var(--descriptions-column-gap)] gap-y-[var(--descriptions-row-gap)]",
          colsClass,
          className,
        )}
      >
        {children}
      </dl>
    </DescriptionsLayoutContext.Provider>
  );
}

export interface DescriptionsItemProps {
  label: React.ReactNode;
  /** Use mono spacing for IDs, paths, JSON. */
  mono?: boolean;
  /** Span full row(s) when value is long. */
  span?: 2 | 3;
  className?: string;
  children: React.ReactNode;
}

Descriptions.Item = function DescriptionsItem({
  label,
  mono,
  span,
  className,
  children,
}: DescriptionsItemProps) {
  const { layout, labelAlign } = React.useContext(DescriptionsLayoutContext);
  const spanClass = span === 2 ? "sm:col-span-2" : span === 3 ? "sm:col-span-2 lg:col-span-3" : "";
  // The EFFECTIVE label alignment, after the vertical guard below. Reflected only when it is the
  // non-default `end` so an untouched item gains no attribute (the `data-priority` rule).
  const endAlignedLabel = layout === "horizontal" && labelAlign === "end";
  return (
    <div
      data-slot="descriptions-item"
      className={cn(
        layout === "horizontal"
          ? // Label beside value — a token-aligned label column so the values line up. The
            // `--descriptions-label-width` / `--descriptions-label-gap` knobs align labels and set
            // to close the gap in the same step.
            "grid grid-cols-[var(--descriptions-label-width)_minmax(0,1fr)] items-baseline gap-x-[var(--descriptions-label-gap)]"
          : // Vertical (default): label over value. The shared --field-label-gap matches
            // FormField / Form so the label→value gap is consistent everywhere.
            "grid gap-[var(--field-label-gap)]",
        spanClass,
        className,
      )}
    >
      <dt
        data-slot="descriptions-label"
        data-label-align={endAlignedLabel ? "end" : undefined}
        className={cn(
          "text-muted-foreground text-xs",
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
};
