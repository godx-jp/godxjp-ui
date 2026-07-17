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
  CenteredShellWidthProp,
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
  /**
   * Override the breadcrumb `<nav>` landmark's accessible name. Defaults to a localized
   * "Breadcrumb". Needed when more than one `PageContainer` (each with its own `breadcrumb`)
   * renders on the same page/view — two `<nav>` landmarks sharing one name/role fail axe's
   * `landmark-unique` (WCAG 2.4.1 / 1.3.1).
   */
  breadcrumbLabel?: string;
  /** Kebab/DOM-style alias of `breadcrumbLabel` (same landmark-unique override). */
  breadcrumbAriaLabel?: string;
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
  /**
   * Navigation shown in the mobile drawer below the `lg` breakpoint, where the docked sidebar is
   * hidden. AppShell OWNS the drawer: it renders a hamburger trigger in the topbar and a focus-
   * trapped Sheet (Esc + overlay close, focus returns to the trigger) — hiding the sidebar without
   * a reachable alternative is invalid (gh#165). Defaults to `sidebar`, so the same nav is
   * available on mobile with no extra wiring; pass a distinct node for a mobile-tailored menu, or
   * `null` to opt out (only when navigation lives elsewhere, e.g. a bottom bar).
   */
  mobileNav?: ReactNode;
  /** Accessible title for the mobile navigation drawer. Defaults to the localized "Menu". */
  mobileNavLabel?: string;
  /** Controlled open state of the mobile drawer. Omit for AppShell-owned (uncontrolled) state. */
  mobileNavOpen?: boolean;
  /** Change handler for the mobile drawer open state (pairs with `mobileNavOpen`). */
  onMobileNavOpenChange?: (open: boolean) => void;
};

/**
 * @see AuthShell — centred auth/login page shell (login · mfa · passkey · device · reset). A
 * top brand bar, a centred `main` that holds the auth `Card`, and an optional footer, over a
 * `min-h-dvh` surface. The shell scopes `--control-height` to the comfortable tier (44px, the WCAG
 * touch floor) and bumps the auth heading size so forms read at the right density — replacing
 * consumers' hand-rolled `.auth-shell-*` / `.ui-auth-scope` classes. Motion is delegated to
 * `Reveal` (wrap the card) so `prefers-reduced-motion` is honoured at one place.
 */
export type AuthShellProp = {
  /** Centred content — typically a single auth `<Card>` with the form. */
  children: ReactNode;
  /** Brand bar slot pinned to the top (e.g. a `<Logo>` / product mark). */
  brand?: ReactNode;
  /** Footer slot pinned to the bottom (legal links, locale switch, support). */
  footer?: ReactNode;
  className?: ClassNameProp;
};

/**
 * @see CenteredShell — authenticated, no-sidebar, centred-column page shell (hosted-ID "My Page",
 * account / self-service, standalone settings). A padded top bar with real actions (banner) reusing
 * AppShell's `.app-topbar` chrome WITHOUT a sidebar, a scrollable `main` holding a centred column of
 * configurable medium width (`width` = sm|md|lg, all wider than AuthShell's 24rem card) top-aligned
 * so sections flow + scroll, and an optional footer (contentinfo). Fills the gap between AppShell
 * (needs a sidebar) and AuthShell (unauthenticated, narrow vertically-centred card) — so a hosted
 * account page needs ZERO custom CSS and never hand-rolls a bar (the `.ui-topbar` zero-inset
 * footgun). Layout-only; delegate motion to `Reveal`.
 */
export type CenteredShellProp = {
  /** Centred column content — page sections (identity hero, org picker, service grid, team list). */
  children: ReactNode;
  /**
   * Top bar slot (banner) — a `<Topbar>` with brand + real actions (an `AppSettingPicker`, a user
   * menu, sign-out). CenteredShell wraps it in the SAME padded chrome as AppShell's topbar
   * (padding-inline · border · backdrop), so you never hand-roll a bar. Omit → no banner.
   */
  topbar?: ReactNode;
  /** Footer slot (contentinfo) pinned to the bottom (legal links, locale switch, support). Omit → none. */
  footer?: ReactNode;
  /**
   * Max-width of the centred content column: `sm` ~32rem, `md` (default) ~46rem, `lg` ~64rem — all
   * wider than AuthShell's 24rem auth card. A service retunes each tier via `--centered-shell-width-*`.
   */
  width?: CenteredShellWidthProp;
  className?: ClassNameProp;
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
  /**
   * Render the row as a real anchor (`<a href>`) — the link is the SOLE interactive element (no
   * nested `<button>`). Use for MPA links / right-click-open-in-new-tab. Omit for SPA rows that
   * report selection via `onSelect(id)`. For a framework router `<Link>`, use `renderItem` instead
   * (its returned element is merged as the row via Slot, so there is still no nested interactive).
   */
  href?: string;
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
  /** Accessible navigation landmark name; make it unique when multiple sidebars share a document. */
  ariaLabel?: string;
  activeId: string;
  onSelect?: (id: string) => void;
  sections?: SidebarSectionProp[];
  product?: SidebarProductProp;
  onProductClick?: () => void;
  brand?: ReactNode;
  collapsed?: boolean;
  children?: ChildrenProp;
  /**
   * Escape hatch to render a leaf row as a custom element — typically a framework router `<Link>`.
   * Return a SINGLE interactive element; the Sidebar merges the row styling + active state onto it
   * via Slot (so it is the row and the sole interactive element — no nested `<button>`). Any
   * secondary affix (a star, a count) must be a non-interactive descendant of that element.
   */
  renderItem?: (item: SidebarItemData) => ReactNode;
  footer?: ReactNode;
  /**
   * Override the nav landmark's accessible name. Defaults to a localized "Main navigation".
   * Needed when more than one Sidebar renders on the same page/view (e.g. a docked sidebar +
   * its mobile-drawer twin, both mounted at once) — two `<nav>` landmarks sharing one name/role
   * fail axe's `landmark-unique` (WCAG 2.4.1 / 1.3.1).
   */
  "aria-label"?: string;
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
