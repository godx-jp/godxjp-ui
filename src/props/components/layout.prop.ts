/** Layout component prop types — @see docs/COMPONENTS.md#layout */
import type * as React from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import type {
  BreadcrumbProp,
  PageTitleProp,
  SubtitleProp,
  ExtraProp,
  FooterProp,
  PageDensityProp,
  PageContainerVariantProp,
  StackGapProp,
  InlineGapProp,
  ClassNameProp,
  ChildrenProp,
} from "../vocabulary";

/** @see PageContainer */
export type PageContainerProp = {
  title: PageTitleProp;
  subtitle?: SubtitleProp;
  extra?: ExtraProp;
  footer?: FooterProp;
  breadcrumb?: BreadcrumbProp;
  density?: PageDensityProp;
  variant?: PageContainerVariantProp;
  /** Pin footer to viewport bottom on scroll — pairs well with `variant="narrow"`. */
  stickyFooter?: boolean;
  children?: ChildrenProp;
  className?: ClassNameProp;
};

/** @see Stack */
export type StackProp = React.HTMLAttributes<HTMLDivElement> & {
  gap?: StackGapProp;
};

/** @see Inline */
export type InlineProp = React.HTMLAttributes<HTMLDivElement> & {
  gap?: InlineGapProp;
};

/** @see PageInset — padded strip inside flush PageContainer (FilterBar, intro). */
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
export type SidebarSectionProp = {
  label?: string;
  items: SidebarItemProp[];
};

/** @see Sidebar */
export type SidebarProp = {
  activeId: string;
  onSelect?: (id: string) => void;
  sections: SidebarSectionProp[];
  product?: SidebarProductProp;
  onProductClick?: () => void;
  brand?: ReactNode;
  collapsed?: boolean;
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
  onProductOpen?: () => void;
  onProjectOpen?: () => void;
  onSearchOpen?: () => void;
  onTweaksOpen?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  rightSlot?: ReactNode;
  unread?: boolean;
  onNotificationsOpen?: () => void;
  user?: ReactNode;
};

/** @deprecated Use PageContainerProp — header-only legacy shell. */
export type PageHeaderProp = {
  title: PageTitleProp;
  description?: SubtitleProp;
  breadcrumb?: BreadcrumbProp;
  actions?: ExtraProp;
  className?: ClassNameProp;
};
