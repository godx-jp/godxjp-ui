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
  CenteredShellAlignProp,
  AuthShellPresetProp,
  BreakpointProp,
  GapProp,
  ClassNameProp,
  ChildrenProp,
  IdProp,
  DisabledProp,
} from "../vocabulary";

/**
 * Arrangement of the page header's title band and its `extra` slot below the 640px step.
 * `stack` (default) is the historical arrangement — `extra` drops onto its own full-width line
 * under the subtitle. `responsive-inline` keeps `extra` beside the title band at the
 * `--page-header-extra-measure` measure, letting the title/subtitle wrap into what is left.
 */
export type PageContainerHeaderLayoutProp = "stack" | "responsive-inline";

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
  /**
   * How the title band and `extra` share the header row below the 640px step. Defaults to
   * `stack` — the historical arrangement, where `extra` wraps onto its own full-width line under
   * the subtitle. Use `responsive-inline` to keep ONE compact control (a search field, a single
   * primary action) beside the title at 390px, at the token-owned
   * `--page-header-extra-measure`. At >=640px both arrangements are identical.
   */
  headerLayout?: PageContainerHeaderLayoutProp;
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

export type MasterDetailRailWidthProp = "compact" | "standard";
export type MasterDetailRailProp = "master" | "detail";
/**
 * Bounded viewport preset for the master collection. `auto` (default) never bounds it — the
 * region grows with its content, exactly as before. `compact` / `standard` cap its block size
 * with the `--master-detail-master-viewport-*` tokens and scroll the collection inside the
 * region, so a long list cannot push the detail below the fold once the layout stacks.
 */
export type MasterDetailMasterViewportProp = "auto" | "compact" | "standard";

/** @see MasterDetail */
export type MasterDetailProp = {
  /** Selectable collection; always first in DOM order, so the stacked order stays list-then-detail. */
  master: ReactNode;
  /** Detail surface for the current selection. */
  children: ChildrenProp;
  /**
   * Which region is the fixed-width rail; the other one is fluid. Defaults to `detail` — the
   * canonical fluid-list + fixed-detail-rail composition. Use `master` for a leading
   * category/navigator rail beside a fluid detail surface.
   */
  rail?: MasterDetailRailProp;
  /** Rail track width: `compact` = 300px; `standard` = 320px. */
  railWidth?: MasterDetailRailWidthProp;
  /**
   * Bound the master collection to a scrollable viewport instead of letting it grow with its
   * content. `auto` (default) keeps the unbounded behaviour. `compact` (20rem) / `standard`
   * (28rem) read the `--master-detail-master-viewport-*` tokens, scroll the collection INSIDE the
   * region, and make it a keyboard-reachable scroll container. Pair with `masterLabel` so the
   * scroll region is announced.
   */
  masterViewport?: MasterDetailMasterViewportProp;
  /**
   * Stack the two regions below this breakpoint (`false` never stacks). Omit to inherit the
   * themeable `--master-detail-collapse-below` token (default 40rem / the `sm` step).
   */
  collapseBelow?: BreakpointProp | false;
  /** Accessible name for the master region. */
  masterLabel?: string;
  /** Accessible name for the detail region. */
  detailLabel?: string;
  /**
   * Id of the detail region, so the selection controls inside `master` can point at it with
   * `aria-controls` and the app can move focus to it after a selection.
   */
  detailId?: IdProp;
};

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
   * Navigation shown in the mobile drawer at the DXS 900px breakpoint, where the docked sidebar is
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
  /**
   * Visual contract for the auth surface. `"canonical"` applies the shared DXS compact geometry
   * (36px controls, 22.5rem card measure, and responsive page insets) through component tokens.
   * Default `"default"` preserves the existing comfortable shell.
   */
  variant?: "default" | "canonical";
  /**
   * Named flow MEASURE — the page geometry contract for one canonical hosted-identity flow: the
   * auth card's max-width plus the desktop and mobile page gutters, all owned by component tokens
   * (`--auth-shell-{login,device,context,recovery}-*`). Selecting a preset replaces every
   * consumer-side geometry override.
   *
   * - `"default"` (default) — the shell's own measure; nothing changes.
   * - `"login"` — SCR-001's 360px card at x=540/332/15 and y=363/363/353 for the canonical
   *   1440x900, 1024x900 and 390x844 viewports. The identity occupies a package-owned anchor slot,
   *   so standalone, one-line requester and wrapped two-line requester states keep the same card
   *   position without truncating or inventing requester data. Pass AuthIdentity, Card and
   *   AuthFooter as direct children (an anchor may wrap AuthIdentity).
   * - `"device-authorization"` — 380px card measure with a 5px inline page gutter at a 390px
   *   viewport (canonical device-grant artboard).
   * - `"context-selection"` — 25rem card measure on desktop/tablet, edge-to-edge on mobile, and a
   *   tokenized rhythm between the intro, the card and the trailing "remember" row.
   * - `"account-recovery"` — 27rem/432px panel measure with a 15px inline page gutter at 390px
   *   (panel x=15, width=360). One measure for BOTH canonical SCR-008 panels: password recovery
   *   (request · sent · new-password · expired) and the sign-in MFA challenge (OTP · recovery-code
   *   · passkey-failure), whose title and description sit INSIDE the bordered surface.
   *
   * Orthogonal to `variant`: presets are applied AFTER it, so `variant="canonical"` keeps owning
   * control density and heading size while the preset re-measures/anchors the page.
   */
  preset?: AuthShellPresetProp;
  /**
   * Vertical density scoped to auth-card descendants. The canonical variant defaults to
   * `"compact"`; the default variant defaults to `"comfortable"`.
   */
  density?: "comfortable" | "compact";
  className?: ClassNameProp;
};

/** @see AuthDivider */
export type AuthDividerProp = {
  /** Short localized conjunction rendered between the two separator rules (for example, "or"). */
  label: string;
  className?: ClassNameProp;
};

/**
 * @see AuthFooter — the canonical hosted-identity legal line (host · Terms · Privacy · locale).
 * AuthFooter owns ONLY the geometry: the mono type ramp, the wrap behaviour and the `·`
 * separators between the slots that are actually present (tokens `--auth-footer-*`). Every slot
 * is consumer-owned content — real localized links and a real locale control — so the library
 * never invents navigation. Drop it into `AuthShell`'s `footer` slot (which supplies the
 * `contentinfo` landmark); it renders a plain `div`, so it can also sit inside an existing footer.
 */
export type AuthFooterProp = {
  /** Product / host identity — the operator of the auth surface (e.g. "GoDX ID"). */
  product: ReactNode;
  /** Terms-of-service link or localized text. */
  terms: ReactNode;
  /** Privacy-policy link or localized text. */
  privacy: ReactNode;
  /** Optional consumer-owned locale control (e.g. `<AppSettingPicker kind="locale" compact />`). */
  locale?: ReactNode;
  className?: ClassNameProp;
};

/**
 * @see AuthIdentity — the canonical hosted-identity heading block: the brand-green GoDX mark
 * (`Logo mark="godx"`, independent of `--primary`), the `h1` auth heading, and an optional
 * requesting-client line for delegated flows (device grant, OAuth consent). Centred, token-spaced
 * (`--auth-identity-gap` / `--auth-requester-*`) — a consumer never re-centres or re-spaces it.
 */
export type AuthIdentityProp = {
  /** Primary auth heading, rendered as the page `h1`. */
  title: ReactNode;
  /**
   * Optional real requesting-client context ("Attendance is requesting sign in"). Pass it ONLY
   * when the client identity is authoritative — never a placeholder.
   */
  requester?: ReactNode;
  className?: ClassNameProp;
};

/**
 * @see AuthAccountSummary — compact signed-in identity row for hosted authentication surfaces.
 * It owns avatar fallback, bidi-safe email truncation and the keyboard action geometry; the
 * consumer owns the authoritative email, localized action label and navigation handler.
 */
export type AuthAccountSummaryProp = {
  email: string;
  avatarSrc?: string;
  avatarFallback?: ReactNode;
  actionLabel: ReactNode;
  onAction: () => void;
  disabled?: DisabledProp;
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
  /**
   * Block alignment of the centred column inside the `100dvh` shell. `"start"` (default) keeps the
   * top-aligned flowing/scrolling page shape. `"center"` centres the column in the viewport — the
   * SYSTEM-level standalone surface (a 500/503 error page, a maintenance notice) whose full-page
   * geometry must stay package-owned instead of a consumer re-implementing `min-h-dvh` + flex
   * centring. Overflowing content still scrolls from the top (auto block offsets collapse to 0), so
   * a long localized message is never clipped.
   */
  align?: CenteredShellAlignProp;
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
  /**
   * Leading 16px glyph — REQUIRED: the collapsed rail is icon-only and the expanded rail aligns
   * every label to the icon column. Untyped/API-driven data that omits it no longer crashes the
   * shell (the row renders an empty `.sb-icon` slot, keeping the 32px row / 10px gap), but the rail
   * reads as a hole. Its colour is themeable separately from the label via
   * `--sidebar-nav-icon-foreground` (see {@link SidebarProp}).
   */
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: ReactNode;
  disabled?: boolean;
  /**
   * Destination of the row. It is the SOLE interactive element (no nested `<button>`), so
   * right-click / open-in-new-tab / middle-click all work. Omit for SPA rows that only report
   * selection via `onSelect(id)`.
   *
   * With `Sidebar.linkComponent` this same `href` is what the framework router `<Link>` receives —
   * the LIBRARY still composes the row (icon · label · badge · active · collapsed), so a router
   * link never has to reconstruct row markup (gh#213).
   */
  href?: string;
  /** Nested rows — renders a collapsible submenu group (the parent reads active when any child is). */
  children?: SidebarItemProp[];
};

/** @see Sidebar */
export type SidebarItemData = SidebarItemProp;

/**
 * Props the Sidebar hands to `Sidebar.linkComponent` for one nav row (gh#213).
 *
 * Every field is ANCHOR-SAFE — a router `<Link>` may spread the whole object onto its `<a>` without
 * emitting an unknown-DOM-attribute warning. `children` is the LIBRARY-COMPOSED row content (the
 * `.sb-icon` slot, the `.sb-label`, the `.sb-badge`); render it as-is and never rebuild it, which is
 * what makes icons/badges survive a consumer link (the reported production regression).
 */
export type SidebarLinkProp = {
  /** `SidebarItemProp.href`. Absent for a disabled row — render an inert `<a>` with no navigation. */
  href?: string;
  /** Library-composed row content: icon slot + label + badge (icon only on the collapsed rail). */
  children: ReactNode;
  /** Canonical row class (`sb-nav-item`, plus `sb-nav-item--sub` for a submenu child). */
  className: string;
  /** Present only on the active row — drives `--sidebar-item-active-*`. */
  "data-active"?: "true";
  /** WAI-ARIA current-page semantics for the active row. */
  "aria-current"?: "page";
  /** Set when the item (or its row) is disabled; the row must not navigate. */
  "aria-disabled"?: true;
  /** Accessible name for the icon-only collapsed rail, where the visible label is hidden. */
  "aria-label"?: string;
  /** `"menuitem"` inside the collapsed rail's portaled flyout menu; absent for ordinary rows. */
  role?: "menuitem";
  /** Reports selection to `Sidebar.onSelect` after the router link runs its own handler. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

/**
 * A framework router link component driven by {@link SidebarLinkProp} — Inertia's `<Link href>`,
 * a React Router / TanStack link wrapped by `createSidebarLink(Link, "to")`, or any component that
 * renders a single `<a>`. It must forward its `ref` to that anchor so the collapsed rail's Tooltip
 * can anchor to it.
 */
export type SidebarLinkComponentProp = ComponentType<SidebarLinkProp>;

/**
 * Row state supplied to the DEPRECATED `Sidebar.renderItem`.
 *
 * @deprecated Prefer `Sidebar.linkComponent` (or `SidebarItem asChild`), where the library composes
 * the row and the consumer supplies only the element. `renderItem` leaves row CONTENT to the
 * consumer, which is how a `<Link>{item.label}</Link>` silently dropped every icon and badge
 * (gh#213). Spreading `rowProps` — including its `children` — now yields the canonical row.
 */
export type SidebarRenderItemProp = {
  className: string;
  "data-active"?: "true";
  "aria-current"?: "page";
  "aria-disabled"?: true;
  /**
   * Library-composed row content (icon slot · label · badge). Spread `rowProps` onto your element,
   * or render `rowProps.children` explicitly, to keep the canonical row while adding an affix.
   */
  children?: ReactNode;
};

/** @see Sidebar */
export type SidebarSectionProp = {
  label?: string;
  items: SidebarItemProp[];
};

/** One selectable organization in the public {@link OrgSwitcher} contract. */
export type OrgSwitcherOrganization = {
  id: string;
  name: string;
  /** Secondary organization context, for example the member's role or tenant identifier. */
  meta?: ReactNode;
  /** Optional owned mark/avatar. When omitted, OrgSwitcher renders the first name character. */
  avatar?: ReactNode;
  /**
   * Status/plan affordance rendered end-aligned in the expanded trigger and in the menu row
   * (e.g. `<Badge tone="warning">Trial</Badge>`). Hidden in the collapsed rail, which only has room
   * for the mark. Pair a non-textual badge with {@link OrgSwitcherOrganization.badgeLabel}.
   */
  badge?: ReactNode;
  /**
   * Localized screen-reader text for `badge`. Required whenever the badge carries meaning the
   * accessible name would otherwise lose (WCAG 1.1.1 / 1.4.1): the trigger's `aria-label` owns its
   * accessible name, so the badge is announced through `aria-describedby` instead. When omitted, a
   * textual badge is still announced inside the menu row but NOT on the trigger.
   */
  badgeLabel?: string;
  disabled?: boolean;
};

/** Localized copy owned by the consuming product, never hard-coded by the component. */
export type OrgSwitcherLabels = {
  trigger: (organizationName: string) => string;
  title: string;
  search: string;
  empty: string;
  loading: string;
  retry?: string;
};

/** @see OrgSwitcher */
export type OrgSwitcherProp = {
  organizations: readonly OrgSwitcherOrganization[];
  value?: string;
  onValueChange?: (value: string) => void;
  collapsed?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Error content replaces the list while preserving the trigger and retry affordance. */
  error?: ReactNode;
  onRetry?: () => void;
  labels: OrgSwitcherLabels;
  /**
   * `"auto"` (default) uses the desktop popover above `--sheet-responsive-breakpoint-width` and a
   * focus-trapped bottom Sheet at/below it — the SAME token that drives `SheetContent
   * responsive="auto"`, resolved through the shared `useSheetResponsiveMode()` hook, so a service
   * moves the drawer line once for every overlay instead of per component.
   * Explicit modes are useful for deterministic embedded surfaces and component tests.
   */
  responsive?: "auto" | "popover" | "sheet";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: ClassNameProp;
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
   * THE framework-router contract (gh#213). Supply only the LINK ELEMENT TYPE; the Sidebar still
   * composes the row — icon slot, label, badge, `data-active`/`aria-current`, the icon-only
   * collapsed rail and its tooltip name — and passes it as {@link SidebarLinkProp} `children`.
   * Used for every row that carries an `href`: top-level leaves, submenu children, collapsed-rail
   * leaves and collapsed flyout entries. A group TRIGGER stays a `<button>` (it owns
   * `aria-expanded` disclosure semantics per WAI-ARIA APG); its children take the link.
   *
   * Rows without an `href` keep the `<button>` + `onSelect(id)` shape — a router link with no
   * destination is not a link.
   *
   * @example
   * ```tsx
   * // Inertia — its <Link href> already matches SidebarLinkProp.
   * import { Link } from "@inertiajs/react";
   * <Sidebar linkComponent={inertiaSidebarLink(Link)} sections={sections} activeId={activeId} />
   *
   * // React Router / TanStack — remap `href` to `to`.
   * import { Link } from "react-router-dom";
   * <Sidebar linkComponent={createSidebarLink(Link, "to")} sections={sections} activeId={activeId} />
   * ```
   */
  linkComponent?: SidebarLinkComponentProp;
  /**
   * @deprecated Use {@link SidebarProp.linkComponent} (or `SidebarItem asChild`) instead — there the
   * LIBRARY composes the row and you supply only the element, so icons/labels/badges cannot be lost.
   *
   * Legacy escape hatch: return a SINGLE interactive element and the Sidebar merges the row styling
   * + active state onto it via Slot. Because row CONTENT stayed consumer-authored, a
   * `<Link>{item.label}</Link>` silently dropped every icon and badge (the gh#213 production
   * regression). `rowProps` now also carries the composed `children`, so spreading it restores the
   * canonical row.
   */
  renderItem?: (item: SidebarItemData, rowProps: SidebarRenderItemProp) => ReactNode;
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

/**
 * @see LegalDocumentShell — one entry of the table of contents + the matching document section.
 * `id` is the REAL anchor target (`href="#{id}"`, `<section id>`), so it must be unique on the page
 * and URL-safe: it is what a deep link, a hash jump and `aria-current` all key off.
 */
export type LegalDocumentSectionProp = {
  /** URL-safe anchor id — the `<section id>` AND the contents `href="#…"` target. */
  id: string;
  /** Section heading text — rendered as an `<h2>` AND reused as the contents-list label. */
  title: string;
  /** Section body. Consumer-owned legal copy: paragraphs, lists, tables, nested `<h3>`s. */
  content: ReactNode;
};

/**
 * @see LegalDocumentShell — the long-form legal/policy document surface (terms of service, privacy
 * policy, DPA, cookie policy, SLA, EULA) with a table of contents.
 *
 * It owns the parts an app must NOT re-implement: the readable measure + top-aligned document
 * geometry, the sticky contents rail (single-column compact block below 56rem), scroll-spy
 * active-section tracking, hash deep-linking with a token-driven scroll offset, focus handoff to
 * the target `<section>`, and `prefers-reduced-motion`-aware smooth scrolling. All legal TEXT stays
 * owned by the consumer — the shell only receives it through `sections` and the slots.
 *
 * Semantics: `<article>` labelled by the document title · a NAMED `<nav>` for the contents · REAL
 * `<a href="#…">` anchors carrying `aria-current="location"` · one `<section>` per entry, labelled
 * by its `<h2>`.
 */
export type LegalDocumentShellProp = {
  /** Document title — the `<h1>` that names the `<article>` (e.g. "Terms of Service"). */
  title: TitleProp;
  /**
   * Document version identifier (e.g. `"2.4"`). Rendered as a localized "Version {version}" line —
   * pass the bare identifier, never a pre-localized sentence.
   */
  version?: string;
  /**
   * Effective date as an **ISO 8601** calendar date (`yyyy-MM-dd`) or a full ISO instant. Formatted
   * for display with `Intl.DateTimeFormat` in the active locale and emitted inside a
   * `<time dateTime={effectiveDate}>`, so the machine-readable value is always the ISO input.
   * NEVER pass a pre-formatted string.
   */
  effectiveDate?: string;
  /** Short plain-language summary rendered under the metadata, above the contents. */
  summary?: ReactNode;
  /**
   * Accessible name + visible caption of the contents `<nav>` (e.g. "Contents"). Defaults to a
   * localized "Contents"; override it when two documents render in the same view, so the two `nav`
   * landmarks stay distinguishable (axe `landmark-unique`, WCAG 2.4.1).
   */
  contentsLabel?: string;
  /** The document's sections, in reading order. Drives BOTH the contents list and the body. */
  sections: LegalDocumentSectionProp[];
  /**
   * Controlled active section id (the entry marked `aria-current="location"`). Pair it with
   * `onActiveSectionChange`; omit both for the uncontrolled form.
   */
  activeSection?: string;
  /** Uncontrolled initial active section id. Defaults to the first section. */
  defaultActiveSection?: string;
  /**
   * Fires whenever the active section changes — on a contents-anchor activation, on an initial
   * hash deep link, and continuously from the scroll spy as the reader moves through the document.
   */
  onActiveSectionChange?: (sectionId: string) => void;
  /**
   * Slot above the contents list in the rail — a document switcher across the legal set
   * (Terms · Privacy · Cookies). Rendered as a plain wrapper, so the consumer owns its semantics.
   */
  documentNavigation?: ReactNode;
  /** Slot below the last section — the accept/download/print/contact actions. */
  footerAction?: ReactNode;
  id?: IdProp;
  className?: ClassNameProp;
};
