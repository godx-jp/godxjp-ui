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

/** @see Topbar */
export type TopbarProductProp = {
  name: string;
  color?: string;
};

/** @see Topbar */
export type TopbarProjectProp = {
  name: string;
};

/** @see Topbar */
export type TopbarProp = {
  product: TopbarProductProp;
  project?: TopbarProjectProp | null;
  /** Dropdown content for the product chip — renders a `DropdownMenuContent`. Turns the chip
   *  into a switcher (e.g. an active-entity picker) instead of firing `onProductOpen`. */
  productMenu?: ReactNode;
  /** Dropdown content for the project chip. When neither `project` nor `projectMenu` is set the
   *  project chip is hidden (no dead "Pick project" placeholder). */
  projectMenu?: ReactNode;
  onProductOpen?: () => void;
  onProjectOpen?: () => void;
  onSearchOpen?: () => void;
  onTweaksOpen?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  rightSlot?: ReactNode;
  unread?: boolean;
  /** Accessible placeholder when project is intentionally unset but a project chip is rendered. */
  projectPlaceholder?: string;
  onNotificationsOpen?: () => void;
  user?: ReactNode;
};
