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
   * Text alignment of each item's label within its label column — the SAME contract `Form`
   * exposes (gh#294), so a `Descriptions` composed beside a `Form`/`FormField` (a read-only
   * name/email block above an editable role field, for example) can be told to match it. Applies
   * only in `layout="horizontal"` — a vertical label sits above the value and end-aligning it
   * there would read as a mistake, exactly like `Form`'s own contract. Default `"start"`, matching
   * this component's historical unconditional start-align — no existing consumer's render changes.
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
      {/* Row gap is a TOKEN (`--descriptions-row-gap`, rule #44/#45), not a hardcoded utility, so a
       * consumer composing this beside a Form/FormField can retune it to the same rhythm
       * (`--space-4`) instead of the two blocks reading as visually unrelated (gh#294). Default
       * unchanged from the historical `gap-y-3`, so no existing consumer's render changes. */}
      <dl className={cn("grid gap-x-6 gap-y-[var(--descriptions-row-gap)]", colsClass, className)}>
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
      <dt
        className={cn(
          "text-muted-foreground text-xs",
          // `end`-align only ever applies in horizontal layout — same guard `Form` uses, so a
          // vertical label (already above its value) never mistakenly end-aligns (gh#294).
          layout === "horizontal" && labelAlign === "end" && "text-end",
        )}
      >
        {label}
      </dt>
      <dd className={cn("text-sm break-all", mono && "font-mono")}>{children}</dd>
    </div>
  );
};
