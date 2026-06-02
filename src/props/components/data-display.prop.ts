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
export type EmptyStateProp = {
  icon?: IconProp;
  title: TitleProp;
  description?: DescriptionProp;
  action?: ActionProp;
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
  tone?: ToneProp;
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
