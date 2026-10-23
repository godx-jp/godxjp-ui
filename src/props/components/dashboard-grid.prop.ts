import type * as React from "react";
import type { BreakpointProp } from "../vocabulary";

/** Integer grid coordinates, zero-based from inline-start. Stable id owns persistence. */
export interface DashboardGridItemProp {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface DashboardGridProp extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Each tile owns its Card and visible label header; content is the body (e.g. CardContent). */
  items: { id: string; label: string; content: React.ReactNode }[];
  layout?: DashboardGridItemProp[];
  defaultLayout?: DashboardGridItemProp[];
  onLayoutChange?: (layout: DashboardGridItemProp[]) => void;
  columns?: number | ({ base: number } & Partial<Record<BreakpointProp, number>>);
  /** Row track size in pixels; omitted reads --dashboard-grid-row-height. */
  rowHeight?: number;
  editable?: boolean;
}
