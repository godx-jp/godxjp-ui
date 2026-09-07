/**
 * Navigation & wayfinding prop types.
 * @see docs/PROPS-VOCABULARY.md#navigation
 */
import type * as React from "react";

import type { LabelProp } from "./shared.prop";

/**
 * One entry of the dropdown a breadcrumb segment can open (Ant Design
 * `BreadcrumbItemType.menu.items`). `to` makes the entry a link, `onSelect` on the menu makes it
 * a command; an entry with neither is inert.
 */
export type BreadcrumbItemMenuEntryProp = {
  /** Stable identity, passed to `onSelect`. Also the React key. */
  value: string;
  label: LabelProp;
  to?: string;
  disabled?: boolean;
};

/**
 * Sibling picker hung off a breadcrumb segment (Ant Design `BreadcrumbItemType.menu`) — the
 * "switch to another project at this level" affordance. The segment grows a disclosure chevron and
 * becomes the menu trigger.
 */
export type BreadcrumbItemMenuProp = {
  items: BreadcrumbItemMenuEntryProp[];
  /** Fires with the chosen entry's `value`. Omit when every entry is a plain `to` link. */
  onSelect?: (value: string) => void;
};

/** Single breadcrumb segment. */
export type BreadcrumbItemProp = {
  label: LabelProp;
  /** Router path — omit on current (last) segment. */
  to?: string;
  /** Ant Design `menu` — a sibling dropdown on this segment. @see BreadcrumbItemMenuProp */
  menu?: BreadcrumbItemMenuProp;
};

/** Ordered breadcrumb trail above page title. */
export type BreadcrumbProp = BreadcrumbItemProp[];

/**
 * Ant Design `separator` — what is drawn between two segments. Default is the chevron glyph; a
 * string (`"/"`) or any node replaces it, and `""` removes the separator entirely.
 */
export type BreadcrumbSeparatorProp = React.ReactNode;

/**
 * Ant Design `itemRender` — replaces the anchor/text of ONE segment while the library keeps
 * owning the `<nav>`/`<ol>`/`<li>` structure, the separators and `aria-current`. Use it to hand
 * the trail a router `<Link>` (Inertia, react-router) instead of a bare `<a>`.
 */
export type BreadcrumbItemRenderProp = (
  item: BreadcrumbItemProp,
  info: { index: number; isLast: boolean; items: BreadcrumbProp },
) => React.ReactNode;
