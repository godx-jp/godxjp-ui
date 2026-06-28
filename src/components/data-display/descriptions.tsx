// Descriptions — for detail-page metadata. Replaces hand-rolled <dl><dt><dd> layouts.
import * as React from "react";

import { cn } from "../../lib/utils";
import type { DescriptionsLayoutProp } from "../../props/vocabulary/interaction.prop";

export type { DescriptionsLayoutProp };

const DescriptionsLayoutContext = React.createContext<DescriptionsLayoutProp>("vertical");

export interface DescriptionsProps {
  columns?: 1 | 2 | 3;
  /** Label placement within each item. Default `vertical` (label over value). */
  layout?: DescriptionsLayoutProp;
  className?: string;
  children: React.ReactNode;
}

export function Descriptions({
  columns = 2,
  layout = "vertical",
  className,
  children,
}: DescriptionsProps) {
  const colsClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";
  return (
    <DescriptionsLayoutContext.Provider value={layout}>
      <dl className={cn("grid gap-x-6 gap-y-3", colsClass, className)}>{children}</dl>
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
  const layout = React.useContext(DescriptionsLayoutContext);
  const spanClass = span === 2 ? "sm:col-span-2" : span === 3 ? "sm:col-span-2 lg:col-span-3" : "";
  return (
    <div
      className={cn(
        layout === "horizontal"
          ? // Label beside value — a token-aligned label column so the values line up. The
            // `--descriptions-label-width` knob aligns labels (rule #44/#45).
            "grid grid-cols-[var(--descriptions-label-width)_minmax(0,1fr)] items-baseline gap-x-3"
          : // Vertical (default): label over value. The shared --field-label-gap matches
            // FormField / Form so the label→value gap is consistent everywhere.
            "grid gap-[var(--field-label-gap)]",
        spanClass,
        className,
      )}
    >
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className={cn("text-sm break-all", mono && "font-mono")}>{children}</dd>
    </div>
  );
};
