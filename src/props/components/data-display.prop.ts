/** Data Display component prop types — @see docs/COMPONENTS.md#data-display */
import type * as React from "react";
import type {
  ActionProp,
  ClassNameProp,
  DescriptionProp,
  IconProp,
  TitleProp,
  ColumnDefProp,
  GetRowIdProp,
  OnRowClickProp,
  OnSelectChangeProp,
  OnSortChangeProp,
  OnTableDensityChangeProp,
  SelectedIdsProp,
  SortStateProp,
  TableDensityProp,
  ChildrenProp,
  ToneProp,
} from "../vocabulary";

/** @see EmptyState */
/**
 * Semantic intent of the EmptyState icon medallion — a subset of the shared `ToneProp` vocabulary
 * (no `default`/`neutral`; `destructive` is the DS name for a "danger" state). Drives the
 * `--empty-state-icon-foreground` / `--empty-state-icon-tint` role tokens.
 */
export type EmptyStateToneProp = Extract<
  ToneProp,
  "muted" | "success" | "warning" | "destructive" | "info"
>;

export type EmptyStateProp = {
  icon?: IconProp;
  title: TitleProp;
  /** Semantic title element. Defaults by variant: page=h2, section=h3, compact=p. */
  titleAs?: "h2" | "h3" | "h4" | "p";
  description?: DescriptionProp;
  action?: ActionProp;
  /** Visual weight appropriate to the empty condition. Default `page`. */
  variant?: "page" | "section" | "compact";
  /**
   * Medallion colour intent. Default `muted` (the neutral placeholder look). Set `success` for a
   * confirmation zero-state (e.g. device approved), or `warning`/`destructive`/`info` to match the
   * condition — tints the icon foreground + medallion fill from the matching role token, so a
   * consumer never hand-rolls a `.ui-success-state` class to recolour it.
   */
  tone?: EmptyStateToneProp;
  className?: ClassNameProp;
};

/** @see Descriptions */
export type DescriptionsProp = {
  items: DescriptionsItemProp[];
  columns?: 1 | 2 | 3;
  className?: ClassNameProp;
};

export type DescriptionsItemProp = {
  label: React.ReactNode;
  value: React.ReactNode;
  mono?: boolean;
};

/** @see Badge */
export type BadgeProp = {
  variant?: "default" | "secondary" | "outline";
  /** Status tones plus a brand `primary` tone (soft brand pill); solid brand = `variant="default"`. */
  tone?: ToneProp | "primary";
  status?: string;
  icon?: React.ComponentType<{ className?: string }> | null;
  className?: ClassNameProp;
  children?: ChildrenProp;
};

/** @see DataTable */
export type DataTableProp<T> = {
  data: T[];
  columns: ColumnDefProp<T>[];
  getRowId?: GetRowIdProp<T>;
  selectable?: boolean;
  selected?: SelectedIdsProp;
  onSelectChange?: OnSelectChangeProp;
  onRowClick?: OnRowClickProp<T>;
  density?: TableDensityProp;
  onDensityChange?: OnTableDensityChangeProp;
  sort?: SortStateProp;
  onSortChange?: OnSortChangeProp;
  loading?: boolean;
  empty?: React.ReactNode;
  className?: ClassNameProp;
  children?: ChildrenProp;
};
