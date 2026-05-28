/** Navigation component prop types — @see docs/COMPONENTS.md#navigation */
import type * as React from "react";
import type {
  ChildrenProp,
  ClassNameProp,
  DisabledProp,
  HasActiveFiltersProp,
  LabelProp,
  OnClearFiltersProp,
} from "../vocabulary";

/** @see FilterBar */
export type FilterBarProp = {
  onClear?: OnClearFiltersProp;
  hasActiveFilters?: HasActiveFiltersProp;
  className?: ClassNameProp;
  children: ChildrenProp;
};

/** @see FilterGroup */
export type FilterGroupProp = {
  label: LabelProp;
  className?: ClassNameProp;
  children: ChildrenProp;
};

/** @see Pagination — offset/page-based (distinct from DataTable cursor pagination). */
export type PaginationProp = {
  current?: number;
  total?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
  simple?: boolean;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  onChange?: (page: number, pageSize: number) => void;
};

export type StepStatusProp = "wait" | "process" | "finish" | "error";

/** @see StepItem */
export type StepItemProp = {
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  /** Ant Design `content` — alias `description` supported */
  content?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: StepStatusProp;
  disabled?: boolean;
};

/** @see Steps */
export type StepsProp = {
  items?: StepItemProp[];
  current?: number;
  initial?: number;
  status?: StepStatusProp;
  orientation?: "horizontal" | "vertical";
  type?: "default" | "dot";
  size?: "default" | "small";
  titlePlacement?: "horizontal" | "vertical";
  onChange?: (current: number) => void;
  className?: ClassNameProp;
};

/** Tab pane — Ant Design `items` entry. */
export type TabItemProp = {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
};

/** @see TabsItems — high-level tabs with `items` array. */
export type TabsItemsProp = {
  items: TabItemProp[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (key: string) => void;
  variant?: "default" | "line" | "card";
  className?: ClassNameProp;
  listClassName?: ClassNameProp;
  contentClassName?: ClassNameProp;
};
