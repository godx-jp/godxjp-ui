/** Layout component prop types — @see docs/COMPONENTS.md#layout */
import type * as React from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import type {
  BreadcrumbProp,
  TitleProp,
  SubtitleProp,
  ExtraProp,
  FooterProp,
  PageDensityProp,
  PageContainerVariantProp,
  GapProp,
  ClassNameProp,
  ChildrenProp,
} from "../vocabulary";

/** @see PageContainer */
export type PageContainerProp = {
  title: TitleProp;
  subtitle?: SubtitleProp;
  extra?: ExtraProp;
  footer?: FooterProp;
  breadcrumb?: BreadcrumbProp;
  linkComponent?: React.ElementType;
  density?: PageDensityProp;
  variant?: PageContainerVariantProp;
  /** Pin footer to viewport bottom on scroll — pairs well with `variant="narrow"`. */
  stickyFooter?: boolean;
  /**
   * When the footer is sticky, control WHEN it shows. `"always"` (default)
   * keeps it pinned the whole time. `"onScroll"` hides it until the header
   * (title + `extra` actions) scrolls out of view, then slides it up — the
   * standard edit/create "save bar" so the primary actions stay reachable as
   * the form scrolls, without cluttering the top. The footer stays mounted
   * (no layout reflow → no jitter); observed against the nearest scroll
   * container.
   */
  footerReveal?: "always" | "onScroll";
  /**
   * Grow the body to fill the remaining shell height. Default `false` (top-packed,
   * content-height — short pages leave no stretched void, gh#103). Enable for a
   * full-height DataTable, SplitPane, or a chat surface whose composer is pinned
   * to the bottom via `footer` + `stickyFooter`.
   */
  fill?: boolean;
  children?: ChildrenProp;
  className?: ClassNameProp;
};

export type FlexDirectionProp = "row" | "col";
export type FlexAlignProp = "start" | "center" | "end" | "stretch" | "baseline";
export type FlexJustifyProp = "start" | "center" | "end" | "between" | "around" | "evenly";

/** @see Flex */
export type FlexProp = React.HTMLAttributes<HTMLDivElement> & {
  direction?: FlexDirectionProp;
  gap?: GapProp;
  align?: FlexAlignProp;
  justify?: FlexJustifyProp;
  wrap?: boolean;
};

export type ResponsiveGridColumnsProp = number | { sm?: number; md?: number; lg?: number };

/** @see PageContainer.Inset — full-bleed inset region inside the page padding. */
export type PageInsetProp = React.HTMLAttributes<HTMLDivElement> & {
  children?: ChildrenProp;
  className?: ClassNameProp;
};

/** @see AppShell */
export type AppShellProp = {
  sidebar: ReactNode;
  children: ReactNode;
  topbar?: ReactNode;
  topbarLeft?: ReactNode;
  topbarRight?: ReactNode;
  logo?: ReactNode;
  breadcrumb?: ReactNode;
  footer?: ReactNode;
  sidebarCollapsed?: boolean;
};

/** @see Sidebar */
export type SidebarProductProp = {
  name: string;
  role?: string;
  color?: string;
};

/** @see Sidebar */
export type SidebarItemProp = {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: ReactNode;
  disabled?: boolean;
  /** Nested rows — renders a collapsible submenu group (the parent reads active when any child is). */
  children?: SidebarItemProp[];
};

/** @see Sidebar */
export type SidebarItemData = SidebarItemProp;

/** @see Sidebar */
export type SidebarSectionProp = {
  label?: string;
  items: SidebarItemProp[];
};

/** @see Sidebar */
export type SidebarProp = {
  activeId: string;
  onSelect?: (id: string) => void;
  sections?: SidebarSectionProp[];
  product?: SidebarProductProp;
  onProductClick?: () => void;
  brand?: ReactNode;
  collapsed?: boolean;
  children?: ChildrenProp;
  renderItem?: (item: SidebarItemData) => ReactNode;
  footer?: ReactNode;
};

/**
 * @see Topbar — a PURE SLOT bar (no baked chrome). The library only positions three clusters; the
 * CONSUMER decides what goes in each (a brand mark `Avatar`, sidebar toggle, nav, a search trigger, settings
 * pickers like `AppSettingPicker`, a notification button, a user menu). The shell never forces a
 * product switcher, a search box, or a language picker — those are the consumer's components,
 * configured via THEIR own props and dropped into a slot.
 */
export type TopbarProp = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Inline-start cluster — typically the sidebar toggle + a brand mark (`Avatar`) + primary nav. */
  start?: ReactNode;
  /** Center cluster — optional (e.g. a search trigger or a page/entity switcher). */
  center?: ReactNode;
  /** Inline-end cluster — settings pickers, notifications, the user menu. */
  end?: ReactNode;
  /** Escape hatch — render fully custom bar content instead of the three slots. */
  children?: ReactNode;
};
