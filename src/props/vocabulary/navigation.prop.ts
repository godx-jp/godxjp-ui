/**
 * Navigation & wayfinding prop types.
 * @see docs/PROPS-VOCABULARY.md#navigation
 */
import type { LabelProp } from "./shared.prop";

/** Single breadcrumb segment. */
export type BreadcrumbItemProp = {
  label: LabelProp;
  /** Router path — omit on current (last) segment. */
  to?: string;
};

/** Ordered breadcrumb trail above page title. */
export type BreadcrumbProp = BreadcrumbItemProp[];
