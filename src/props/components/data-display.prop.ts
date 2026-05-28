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
  StatusToneProp,
  TableDensityProp,
  ChildrenProp,
} from "../vocabulary";

/** @see EmptyState */
export type EmptyStateProp = {
  icon?: IconProp;
  title: TitleProp;
  description?: DescriptionProp;
  action?: ActionProp;
  className?: ClassNameProp;
};

/** @see KeyValueGrid */
export type KeyValueGridProp = {
  items: KeyValueGridItemProp[];
  columns?: 1 | 2 | 3;
  className?: ClassNameProp;
};

export type KeyValueGridItemProp = {
  label: React.ReactNode;
  value: React.ReactNode;
  mono?: boolean;
};

/** @see StatusBadge */
export type StatusBadgeProp = {
  status: string;
  tone?: StatusToneProp;
  className?: ClassNameProp;
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

/** @see Badge */
export type BadgeProp = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
};
