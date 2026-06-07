// Descriptions — for detail-page metadata. Replaces hand-rolled <dl><dt><dd> layouts.
import * as React from "react";

import { cn } from "../../lib/utils";

export interface DescriptionsProps {
  columns?: 1 | 2 | 3;
  className?: string;
  children: React.ReactNode;
}

export function Descriptions({ columns = 2, className, children }: DescriptionsProps) {
  const colsClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";
  return <dl className={cn("grid gap-x-6 gap-y-3", colsClass, className)}>{children}</dl>;
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
  const spanClass = span === 2 ? "sm:col-span-2" : span === 3 ? "sm:col-span-2 lg:col-span-3" : "";
  return (
    // grid + the shared --field-label-gap so the label→value gap matches FormField / Form everywhere.
    <div className={cn("grid gap-[var(--field-label-gap)]", spanClass, className)}>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className={cn("text-sm break-all", mono && "font-mono")}>{children}</dd>
    </div>
  );
};
